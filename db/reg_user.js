/**
 * Created by Administrator on 2015/12/13.
 * Register userinfo
 *
 {
"reg":{
	"user":"username",
	"phone":"15088551600",
	"mail":"sally@eamon.com",
	"pass":"password"
    }
}

 *
 */
var mongoose= require('./db_conn');

var schema = mongoose.Schema({
    username: String,
    mobile:Number,
    email:String,
    password:String,
    reg_time_cli:String,
    reg_time_srv:String,
    reg_type:String
});

var reg_user=  mongoose.model('users',schema);

module.exports = reg_user;