import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";


const findAccount = async (email) => {

 let account = await User.find({email});

 if (account) {
    return { account, model: User, type: 'User' };
  }

  
  account = await Admin.findOne({ email });

  if (account) {
    return { account, model: Admin, type: 'Admin' };
  }

  
  return null;
};

export {findAccount}


