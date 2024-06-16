const express=require('express');
const path=require('path');
const method_override=require('method-override');
const ejsmate=require('ejs-mate');
const Campground=require('./models/campground');
const app=express();

app.engine('ejs',ejsmate);

app.use(express.urlencoded({extended:true}))

app.use(express.static(path.join(__dirname, 'public')));

app.use(method_override('_method'));

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
var mongoose = require('mongoose');
const campground = require('./models/campground');
var mongoDB = 'mongodb://127.0.0.1/TrailBlaze';
mongoose.connect(mongoDB);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/',(req,res)=>{
    res.render('home')
    })

app.get('/makecampground',async (req,res)=>{
    const camp=new Campground({
        title:'konoha',
        price:'1000',
        description:'naruto fucks sakura here',
        location:'japan'
    })
    await camp.save();
    res.send(camp)

})


app.get('/campgrounds',async(req,res)=>{
   const campgrounds= await Campground.find({})
   res.render('campgrounds/index',{campgrounds})
})

app.get('/campgrounds/new',async(req,res)=>{
    res.render('campgrounds/new')
 })

 app.post('/campgrounds',async(req,res)=>{
     const camp=new Campground(req.body.campground);
     await camp.save();
     res.redirect(`/campgrounds/${camp._id}`)
})
    
    app.get('/campgrounds/:id',async(req,res)=>{
         const id=req.params.id;
         const campground=await Campground.findById(id)
         res.render('campgrounds/show',{campground})
      })


 app.get('/campgrounds/:id/edit',async(req,res)=>{
    const id=req.params.id;
    const campground=await Campground.findById(id)
    res.render('campgrounds/edit',{campground})
 })
 
 app.put('/campgrounds/:id',async(req,res)=>{
    const id=req.params.id;
    const camp=await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${camp._id}`)
 })

 app.delete('/campgrounds/:id',async(req,res)=>{
    const id=req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`)
 })

app.listen(3000,function(){
    console.log('Server is listening on port 3000')
})

