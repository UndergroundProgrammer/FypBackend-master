const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    
    const token = req.headers['authorization'];
//console.log(token);
    if(token==null) return res.status(401).send({message:"There is no token"})
    jwt.verify(token,process.env.SECRET_TOKEN,(err,user) => {
        if(err) return res.status(403).send({message:"You are not Authenticated"});
        req.user = user;
        next();
    })
}

const tokenWithAuthorization = (req, res, next) => {
    verifyToken(req, res, ()=>{
        if(req.user === req.params.user || req.user.isAdmin){
            next();
        }else{
            res.status(401).send({message:"You are not Allowed to do that"});
        }
    });
}

const tokenWithAdminAuthorization = (req, res, next) => {
      verifyToken(req, res, ()=> {
          if(req.user.isAdmin){
              next();
          }else{
              res.status(401).send({message:"You are not Allowed to do that"});
          }
      });
}

module.exports = {verifyToken,tokenWithAuthorization,tokenWithAdminAuthorization};