const router = require('express').Router();
const connectDB =  require('../config/database_config');

//// seller reg and login validation
const {sellerRegisterValidation} = require('../Validations/validation');
const {sellerLoginValidation} = require('../Validations/validation');

const bcrypt = require('bcryptjs');
// const verifyToken = require('../Validation/verifyToken');
//const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();  

// Register Route
router.post('/register', async (req, res) => {
    try {
         // ----------------  Validate data -------------------
        const {error} = sellerRegisterValidation(req.body);
        if (error) return res.status(400).json({message: error.details[0].message});

        // ----------------- Check if Seller already register -----------------
        let find_query = `SELECT * FROM sellers WHERE email = '${req.body.email}' OR name =  '${req.body.name}';`;

        connectDB.query(find_query, async (err, result) => {
            if(err){
                return res.status(400).json({success: 0,error: err.message});
            } 
            else if(result.length != 0){
                return res.status(400).json({success: 0,error: "User Already Exists"});
            }
            else{
                // ----------------- Hash the password ------------------
                const salt = await bcrypt.genSalt(parseInt(process.env.salt_number, 10));
                const hashpassword = await bcrypt.hash(req.body.password, salt);
                req.body.password = hashpassword;

                let status = "ok";
                let reason = "";

                 // // ----------------- Register seller ------------------
                let reg_query = `INSERT INTO sellers (name, email, password, phone, shop_name, shop_type, shop_details, address, city, gender, image_path, status, reason) 
                                VALUES ( '${req.body.name}', '${req.body.email}', '${req.body.password}', '${req.body.phone}', 
                                        '${req.body.shop_name}', '${req.body.shop_type}', '${req.body.shop_details}', 
                                        '${req.body.address}', '${req.body.city}', '${req.body.gender}', '${req.body.image_path}', 
                                        '${status}', '${reason}'); `;

                connectDB.query(reg_query, (err, result) => {
                    if (err)
                    {
                        return res.status(400).json({
                            success: 0,
                            error: err.message
                        });
                    }else
                    {
                        return res.status(200).json({
                            success: 1,
                            message: "user created successfully",
                            user_id: result.insertId
                        });
                    }
                });
            }
        });
    } catch (err) {

        res.status(400).json({
            success: 0,
            description: err.message,
            seller_details: {}
        });
    }
});


// Login Route
router.post('/login', async  (req, res) => {
    
    // ----------------  Validate data -------------------
    const {error} = sellerLoginValidation(req.body);
    if (error) return res.status(400).json({success: 0, error:  'Invalid Email or Password'});


    // ----------------- Check if email exists ------------------
    let find_query = `SELECT * FROM sellers WHERE email = '${req.body.email_username}' OR name = '${req.body.email_username}';`;
    connectDB.query(find_query, async (err, result) => {
        if(err){return res.status(200).json({success: 0,error: err.message});}

        else if(result.length > 0){
            // ----------------- Check if password matched  ------------------
            result = result[0];
            const validpass = await bcrypt.compare(req.body.password, result.password);
            if (!validpass) return res.status(400).json( {success: 0, error: 'Invalid Email or Password'});
            else{
                // user info is matched
                res.status(200).json({
                success:1,
                description: "Successfuly login",
                user_details: {
                    id : result.id,
                    name: result.name
                    }
                });
            }
        }
        else return res.status(400).json({success: 0,error: "Invalid Email or Password"});
    });
});


router.get('/profile', (req, res) => {
    let find_query = `SELECT * FROM sellers WHERE id = '${req.query.id}';`;

    connectDB.query(find_query, (err, result) => {
        if (err) return res.status(400).json({success: 0,error: err.message});
        else if(result.length > 0)
        {
            result = result[0];
            user_profile = {
                name : result.name,
                email :  result.email,
                phone : result.phone,
                shop_name : result.shop_name,
                shop_type : result.shop_type,
                city : result.city,
                gender : result.gender,
                image_path : result.image_path,
                shop_details : result.shop_details,
                address : result.address
            }
            return res.status(200).json({
                success:1,
                data: user_profile
            });
        }
        else{ res.status(400).json({success: 0,error: "user not found"});}
    } );

});


router.get('/products', (req, res) => {
    let find_query = `SELECT * FROM products WHERE seller_id = '${req.query.id}';`;

    connectDB.query(find_query, (err, result) => {
        if (err) return res.status(400).json({success: 0,error: err.message});
        else if(result.length > 0)
        {
            return res.status(200).json({
                success:1,
                data: result
            });
        }
        else{ res.status(400).json({success: 0,error: "product not found"});}
    } );

});


router.get('/orders', (req, res) => {
    let find_query = `SELECT * FROM orders WHERE seller_id = '${req.query.id}';`;

    connectDB.query(find_query, (err, result) => {
        if (err) return res.status(400).json({success: 0,error: err.message});

        else if(result.length > 0){
            return res.status(200).json({success:1, data: result});
        } 

        else{ res.status(400).json({success: 0,error: "no order found"});}
    } );
});

module.exports = router;


