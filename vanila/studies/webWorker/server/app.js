import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import bodyParser from 'body-parser';

const app = express();

app.use(helmet());
app.use('/static', express.static('static'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));

app.use((req, res, next) => {
	//credential request시, 와일드 카드 사용 x
	res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5173');
	//credential 요청 허용
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', '*');
	//body에 데이터 담으면 , Content-type , content-length header 필요합니다 , app.tsx에서 커스텀 헤더인 dovi-header을 넣었으므로, 해당 헤더도 허용해 줍시다
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, Content-Length, X-Requested-With, dovi-header'
	);
	next();
});

//	//preflight 요청시, 사용,어떤 http 헤더가 실제 요청때 사용될지 지정가능
//Access-Control-Request-Headers사용시, 필수
// res.header('Access-Control-Allow-Headers', 'X-Requested-With');

const apiRouter = express.Router();
apiRouter.post('/credential', (req, res) => {
	return res.send('hi from credential');
});

app.use('/', apiRouter);

export default app;
