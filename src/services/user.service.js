const User = require("../models/model.user.js");
const regularExpres = require("../config/regular-expres.js");
const bcrypt = require("bcryptjs");
const { generarJWT } = require("../config/jwt.adapter.js");

class UserService {

  constructor() {}

  async registerUser(data) {

    const { email, last_name, first_name, password } = data;

    if (!email) return "El  email  es obligatorio";

    if (!regularExpres.email.test(email)) return "Email no valido";

    if (!last_name) return "El last_name es obligatorio";

    if (!first_name) return "el first_name es obligatorio";

    if (!password) return "El password es obligatorio";

    try {
      const exist = await User.findOne({ email });

      if (exist) return `El email ya esta registrado ${exist.email}`;

      const user = await new User({ first_name, last_name, email, password });
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password, salt);

      user.save();
      const token = await generarJWT(user._id, user.email);

      return {
        token: token,
      };
      
    } catch (error) {
      console.log(error);
    }
  }
 

  async loginUser(data){
    
    const { email, password } = data;

    if (!email) return "El email es obligatorio";

    

    try {
       
       const user = await User.findOne({ email });

       if (!user) return "El email no esta registrado";

       const validPassword = bcrypt.compareSync(password, user.password);

       if (!validPassword) {
         return {
           ok: false,
           msg: "Contraseña incorrecta",
         };
       }
       const token = await generarJWT(user.id, user.email);

       return {
         user:{
            id:user._id,
            last_name:user.last_name,
            email:user.email
         },
         token: token,
       };
    
    } catch (error) {
      console.log(error);
    }
   

  }






}

module.exports = UserService;
