import mongoose from "mongoose";


const ConnectDb =  async () => {
  try {
    const connectionInstence = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`\n MongoDb Connected !! Db Host: ${connectionInstence}`)
  } catch (err) {

    console.log("DataBase Connection error", err)
   process.exit(1)
    
  }
}

export default ConnectDb;