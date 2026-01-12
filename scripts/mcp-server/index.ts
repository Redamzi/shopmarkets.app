#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// --- KONFIGURATION ---
const PROJECT_FILTER = "shopmarkets"; // Nur Container mit diesem Namensteil werden angezeigt
const SSH_HOST = process.env.MCP_SSH_HOST || "root@your-vps-ip"; // Setze dies in der Umgebung oder hier
// ---

const server = new Server(
    {
        name: "shopmarkets-vps-monitor",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Hilfsfunktion: Zod zu JSON Schema Konvertierung (simpel)
function zodToJsonSchema(schema: any) {
    // Für einfache Objekte reicht eine manuelle Struktur, 
    // in Produktion besser 'zod-to-json-schema' nutzen.
    // Hier hardcoden wir die Struktur für unsere Zwecke.
    if (schema === ContainerLogsSchema) {
        return {
            type: "object",
            properties: {
                containerId: { type: "string", description: "Name oder ID des Containers" },
                lines: { type: "number", description: "Anzahl der Zeilen (Max 500)" }
            },
            required: ["containerId"]
        };
    }
    return { type: "object", properties: {} };
}

const ContainerLogsSchema = z.object({
    containerId: z.string(),
    lines: z.number().optional().default(100),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_containers",
                description: `Listet alle Docker Container auf dem VPS, die zum Projekt '${PROJECT_FILTER}' gehören.`,
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "get_container_logs",
                description: "Holt die Logs eines spezifischen Containers (Read-Only).",
                inputSchema: zodToJsonSchema(ContainerLogsSchema),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Sicherheits-Check: Ist SSH Host konfiguriert?
    if (SSH_HOST === "root@your-vps-ip") {
        return {
            content: [{ type: "text", text: "FEHLER: Bitte konfiguriere die Umgebungsvariable MCP_SSH_HOST (z.B. root@123.456.78.9) oder trage sie in index.ts ein." }],
            isError: true
        }
    }

    switch (request.params.name) {
        case "list_containers": {
            try {
                // Wir filtern direkt im grep befehl für maximale Sicherheit
                // docker ps format: "ID - Names - Status"
                const cmd = `ssh -o BatchMode=yes -o ConnectTimeout=5 ${SSH_HOST} "docker ps --format '{{.ID}} | {{.Names}} | {{.Status}}' | grep '${PROJECT_FILTER}'"`;

                const { stdout, stderr } = await execAsync(cmd);

                if (!stdout && !stderr) {
                    return { content: [{ type: "text", text: `Keine laufenden Container für Projekt '${PROJECT_FILTER}' gefunden.` }] };
                }

                return {
                    content: [{ type: "text", text: stdout || stderr }],
                };
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `SSH Fehler: ${error.message}\nStelle sicher, dass dein SSH-Key geladen ist und der Zugang ohne Passwort funktioniert.` }],
                    isError: true,
                };
            }
        }

        case "get_container_logs": {
            const { containerId, lines = 100 } = ContainerLogsSchema.parse(request.params.arguments);

            // SICHERHEITS-CHECK 2: Prüfen ob der angeforderte Container wirklich zum Projekt gehört
            // Wir holen erst die Liste erneut (kostet wenig)
            try {
                const checkCmd = `ssh -o BatchMode=yes ${SSH_HOST} "docker ps --format '{{.Names}}' | grep '${PROJECT_FILTER}'"`;
                const valdiation = await execAsync(checkCmd);

                if (!valdiation.stdout.includes(containerId) && containerId !== PROJECT_FILTER) { // Einfacher Check, kann verfeinert werden
                    // Wenn der exakte Name nicht in der gefilterten Liste ist: Blockieren.
                    // Ausnahme: Man sucht nach ID. Aber wir verlangen Names.
                    // Besserer Check: Prüfen ob containerId TEIL der gefilterten Liste ist.
                    // Wenn ich "shopmarkets-db" anfordere und es in der Liste steht -> OK.

                    // Strengerer Check:
                    const allowedContainers = valdiation.stdout.split('\n').filter(Boolean);
                    const isAllowed = allowedContainers.some(name => name.includes(containerId) || containerId.includes(name));

                    if (!isAllowed) {
                        return {
                            content: [{ type: "text", text: `ZUGRIFF VERWEIGERT: Container '${containerId}' gehört nicht zum erlaubten Projekt-Scope '${PROJECT_FILTER}'.` }],
                            isError: true
                        }
                    }
                }

                // Limit Lines to max 500 for safety
                const safeLines = Math.min(lines, 500);

                const cmd = `ssh -o BatchMode=yes ${SSH_HOST} "docker logs --tail ${safeLines} ${containerId}"`;
                const { stdout, stderr } = await execAsync(cmd);

                return {
                    content: [{ type: "text", text: stdout || stderr || "Keine Logs vorhanden." }],
                };

            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Fehler beim Log-Abruf: ${error.message}` }],
                    isError: true,
                };
            }
        }

        default:
            throw new Error("Tool not found");
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ShopMarkets VPS Monitor MCP running on stdio");
}

run().catch(console.error);
