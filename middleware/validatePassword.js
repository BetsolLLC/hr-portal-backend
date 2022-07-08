import PasswordValidator from 'password-validator'
import { errorResponse } from '../interceptor/error.js';

var schema = new PasswordValidator;

schema
.is().min(8)                        // Minimum length 8
.is().max(20)                      // Maximum length 20
.has().uppercase(1)               // Must have uppercase letters
.has().lowercase(1)              // Must have lowercase letters
.has().digits(1)                // Must have at least 1 digits
.has().not().spaces()          // Should not have spaces
.has().symbols(1)                 
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


const passwords = function(req,res,next){
    try{
    const {newpassword} = req.body;
    if(schema.validate(newpassword)){
        next();
    }
        else{
           let list = schema.validate(newpassword, { list: true });
            return errorResponse(res,200,list)
        
        }
    }
    catch(err){
        console.log(err);
    }

}

export {passwords};