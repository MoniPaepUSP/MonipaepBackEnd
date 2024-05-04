// import { AppDataSource } from "./database";

import { app } from "./app";
// const main = async () => {
//     await AppDataSource.initialize();
// }

// main().catch(err => {
//     console.log("Typeorm not initialized. " + err)
// })


app.listen(3333, () => console.log("Server Running"))
