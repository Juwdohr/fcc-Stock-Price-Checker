'use strict';

const bodyParser  = require('body-parser'),
      cors        = require('cors'),
      express     = require('express'),
      expect      = require('chai').expect,
      helmet      = require('helmet'),
      mongoose    = require('mongoose'),
      
      apiRoutes         = require('./routes/api.js'),
      fccTestingRoutes  = require('./routes/fcctesting.js'),
      runner            = require('./test-runner');

const CONNECTION_STRING = process.env.DB;

const app = express();
app.enable('trust proxy');


app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    scriptSrc: ["'self' https://code.jquery.com/"]
  }
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true}, (err) => {
  if(err) throw err;
  else console.log('Successful connection to the database.');
});

//Index page (static HTML)
app.route('/').get((req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch(e) {
        const error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
