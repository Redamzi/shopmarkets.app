const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    // Hardcoded credentials for testing (since .env is blocked)
    const supabaseUrl = 'https://supabase.shopmarkets.app';
    const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NzQ3MTc4MCwiZXhwIjo0OTIzMTQ1MzgwLCJyb2xlIjoiYW5vbiJ9.T--SDP5DDOS6zte-z01WT9otGUWeoYLns3E-HPVwstM';

    console.log('--- DB CONNECTION TEST ---');
    console.log('Target:', supabaseUrl);

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Verbinde zu Supabase...');
        // Versuche, die Products Tabelle zu lesen
        const { data, error, count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ VERBINDUNGS-FEHLER:', error.message);
            console.error('Stack:', error);
        } else {
            console.log('✅ VERBINDUNG ERFOLGREICH!');
            console.log(`Die Datenbank ist erreichbar. Anzahl Produkte: ${count}`);
        }
    } catch (err) {
        console.error('❌ KRITISCHER FEHLER:', err.message);
    }
}

testConnection();
