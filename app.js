const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const ejsMate = require('ejs-mate');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

mongoose.connect('mongodb+srv://nirmal141:nirmal14125@cluster0.rejkujz.mongodb.net/lifeStyle?retryWrites=true&w=majority')
    .then(() => {
        console.log("connected")
    })
    .catch(err => {
        console.log("ERROR")
        console.log(err)
    })

const app = express();
app.use(express.urlencoded({extended : true}));


// person Schema


const personSchema = new mongoose.Schema({
    email :{
        type : String,
        // required: true,
        unique: true

    },  
    age :{
        type : Number,
        required: true
        
    },  
    height :{
        type : Number,
        required: true

    },  
    weight :{
        type : Number,
        required: true

    },  
    gender :{
        type : String,
        required: true

    }
    });

    personSchema.plugin(passportLocalMongoose);
    const User  =  mongoose.model('User', personSchema);



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);
// app.use(express.urlencoded({ extended: true }));






const sessionObject = {
    secret : "1234" ,
    resave : false ,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 1000*60*60*24*7,
        maxAge :1000*60*60*24*7 ,
        httpOnly : true
    }
}

app.use(session(sessionObject));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use( new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
        res.locals.currentUser = req.user,
        res.locals.success = req.flash("success"),
        res.locals.error = req.flash("error"),
        next()
})


// calculations and stuff 

app.get('/check', (req, res) => {
    res.render('check')
})

app.post('/check', (req, res) => {
    const {fruit} = req.body;
    res.send(fruit)
})

app.get("/",(req,res)=>{
    res.render("register")
})

app.get('/login', (req,res) => {
    res.render('login')
})

app.get("/diet/:id",async(req,res)=>{
    const id = req.params.id;
    const user = await User.findOne({_id:id});
    const bmi = user.weight/((user.height/100)*(user.height/100));
    var bmr = null;
    if(user.gender === "M"){
         bmr = 88.362+(13.397*user.weight)+(4.799*user.height)-(5.677*user.age)
    }else if(user.gender === "F"){
        bmr = 447.593 +(9.247*user.weight)+(3.098*user.height)-(4.330*user.age)
    }
    var tdee = bmr*1.2875;
    var theObject = {};
    var myClass = null;
    const actdee = tdee.toFixed(2);
    if(bmi>=18.5 && bmi<24.5){
        myClass = 'Meso';
        theObject = {
            'protien' : 'Moderate',
            'carbs' :'Moderate',
            'fats':'Low',
            'calorieIntake':actdee,
            'supplement':'Whey Protein, BCAA'
        }
       
    } else if(bmi>=24.5){
        myClass = 'Endo';
        theObject = {
            'protien' : 'High',
            'carbs' :'Very Low',
            'fats':'Low',
            'calorieIntake':actdee - actdee*0.2,
            'supplement':'Whey Isolate, ClenButerol'
        }
    } else if(bmi>0 && bmi<18.5) {
        myClass = 'Ecto'
        theObject = {
            'protien' : 'High',
            'carbs' :'High',
            'fats':'Moderate',
            'calorieIntake':actdee + actdee*0.2,
            'supplement':'Mass Gainer, Pre-Energizer'
        }
    }
   res.render("diet",{user,myClass,theObject})
})

app.get('/workout/:id', async(req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    const bmi = user.weight/((user.height/100)*(user.height/100));
    if(bmi>=18.5 && bmi<24.5){
        myClass = 'Meso';
        theObject = {
            'TypeI' : 'Cardio',
            'TypeII' :'Weight Lift',
            'Reps':'Moderate',
            'Weight':'High',
            'Workouts':'Cardio- 3/Week, Weight-Lift- 3/Week'
        }
       
    } else if(bmi>=24.5){
        myClass = 'Endo';
        theObject = {
            'TypeI' : 'Cardio',
            'TypeII' :'Weight Lift',
            'Reps':'Very High',
            'Weight':'Moderate-High',
            'Workouts':'Cardio- 3/Week, Weight-Lift- 5/Week'
        }
    } else if(bmi>0 && bmi<18.5) {
        myClass = 'Ecto'
        theObject = {
            'TypeI' : 'Cardio',
            'TypeII' :'Weight Lift',
            'Reps':'Low-Moderate',
            'Weight':'Moderate-Light',
            'Workouts':'Cardio- 1/Week, Weight-Lift- 5/Week'
        }
    }
    res.render('workout',{user, myClass, theObject})
})
app.get("/dashboard/:id",async (req,res)=>{
    const id = req.params.id
    const user = await User.findOne({_id:id})
    const bmi = user.weight/((user.height/100)*(user.height/100));
    const acbmi = bmi.toFixed(2)
    var bmr = null;
    if(user.gender === "M"){
         bmr = 88.362+(13.397*user.weight)+(4.799*user.height)-(5.677*user.age)
    }else if(user.gender === "F"){
        bmr = 447.593 +(9.247*user.weight)+(3.098*user.height)-(4.330*user.age)
    }
    var acbmr = bmr.toFixed(0)
    var myClass = null;
    var metabolism = null;
    if(acbmi>=18.5 && acbmi<24.5){
        myClass = 'Meso'
        metabolism = 'Average'
    } else if(acbmi>=24.5){
        myClass = 'Endo'
        metabolism = 'Low'
    } else if(acbmi>0 && acbmi<18.5) {
        myClass = 'Ecto'
        metabolism = 'High'
    }
    var tdee = bmr*1.2875;
    const actdee = tdee.toFixed(2)
    
    // Men: BMR = 66 + (13.7 x wt in kg) + (5 x ht in cm) - (6.8 x age in years)
    //Women: BMR = 655 + (9.6 x wt in kg) + (1.8 x ht in cm) - (4.7 x age in years) 
    res.render("dashboard",{user,acbmi,acbmr,myClass,actdee,metabolism})
})

app.get('/videoMeso', (req, res) => {
    res.render('videoMeso')
})

app.get('/videoEcto', (req, res) => {
    res.render('videoEcto')
})
app.get('/videoEndo', (req, res) => {
    res.render('videoEndo')
})

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Logged Out Successfully');
    res.redirect('/')
})
app.get('/detailDeit', (req, res) => {
    res.render('detailDeit')
    
})

app.post("/register", async(req,res) =>{
   
    try{
        const { username, password, email, age, height, weight, gender} = req.body;
        const user = new User({email, username, age, height, weight, gender});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser)
        req.flash('success', 'Succcessfully Registered');
        res.redirect(`/dashboard/${user._id}`)
        }
         catch(e){
            req.flash('error', e.message);
            res.redirect('/');
            console.log(e)
        }
    

});

app.post('/login', passport.authenticate( 'local', { failureFlash:true, failureRedirect:'/login'}), (req,res) => {
    const id = req.user.id;
    req.flash('success',`Welcome Back !`);
    res.redirect(`/dashboard/${id}`)
})




app.listen(4000,(req,res)=>{
    console.log("Server started at 4000")
})