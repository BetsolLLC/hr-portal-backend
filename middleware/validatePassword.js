import PasswordValidator from 'password-validator'
import { errorResponse } from '../interceptor/error.js';
import { BLACKLISTED_PASSWORDS } from '../config/config.js';
var schema = new PasswordValidator;

schema
.is().min(8)                        // Minimum length 8
.is().max(20)                      // Maximum length 20
.has().uppercase(1)               // Must have uppercase letters
.has().lowercase(1)              // Must have lowercase letters
.has().digits(1)                // Must have at least 1 digits
.has().not().spaces()          // Should not have spaces
.has().symbols(1)             //  Must have atleast one symbol
.is().not().oneOf(BLACKLISTED_PASSWORDS);// Blacklist these values


const validatePassword = function(req,res,next){
    try{
    const {newpassword} = req.body;
    if(schema.validate(newpassword)){
        next();
    }
        else{
            return errorResponse(res,400,"password does must meet the requirements")
        }
    }
    catch(err){
        logger.error(`error in validing the password ${err}`);
     return errorResponse(res,500,"error in validing the password")
    }

}

export {validatePassword};