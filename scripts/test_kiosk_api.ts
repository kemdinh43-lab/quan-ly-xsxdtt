async function testKiosk() {
    const baseUrl = 'http://localhost:3000/api/hr/timekeeping/scan';
    const code = 'NV_DEMO_01'; // Known demo user

    console.log(`Testing Kiosk API with code: ${code}`);

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Response Status: ${status}`);
        console.log(`Response Body: ${text}`);

        if (status === 200) {
            console.log("✅ API Success");
        } else {
            console.error("❌ API Failed");
        }
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
}

testKiosk();
