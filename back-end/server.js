import { app, port } from "./app.js"


app.listen(port, () => {
    try {
        console.log(`✅ Server is running on port ${port}`);
    } catch (error) {
        console.error('❌ Error starting the server:', error);
    }

})