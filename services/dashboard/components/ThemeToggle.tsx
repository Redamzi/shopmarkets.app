import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "./ThemeProvider"
import { useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Theme wechseln"
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-32 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                        <button
                            onClick={() => { setTheme("light"); setIsOpen(false) }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        >
                            <Sun className="h-4 w-4" /> Hell
                        </button>
                        <button
                            onClick={() => { setTheme("dark"); setIsOpen(false) }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        >
                            <Moon className="h-4 w-4" /> Dunkel
                        </button>
                        <button
                            onClick={() => { setTheme("system"); setIsOpen(false) }}
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-800 font-medium' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                        >
                            <Monitor className="h-4 w-4" /> System
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
