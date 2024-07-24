"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://ofront.vercel.app/', 'https://bgzxtc2t-5173.uks1.devtunnels.ms'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));
const socket_io_1 = require("socket.io");
const server = app.listen('8000', () => console.log('Server is up, 8000'));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'https://ofront.vercel.app/', 'https://bgzxtc2t-5173.uks1.devtunnels.ms'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});
app.get('/', (req, res) => {
    res.send('Server is up');
});
const lib_1 = require("./lib");
let online = 0;
let roomArr = [];
io.on('connection', (socket) => {
    online++;
    io.emit('online', online);
    // on start
    socket.on('start', cb => {
        (0, lib_1.handleStart)(roomArr, socket, cb, io);
    });
    // On disconnection
    socket.on('disconnect', () => {
        online--;
        io.emit('online', online);
        (0, lib_1.handleDisconnect)(socket.id, roomArr, io);
    });
    app.get('/questions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const data = { "inputs": "give me a debatable question about love and friendships, the question should be short and concise, the result of this query should be only the question and you should return me only the question." };
        try {
            // const response = await axios.post(
            //   "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            //   data,
            //   {
            //     headers: { Authorization: "Bearer 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" },
            //   }
            // );
            // const answer = response.data[0].generated_text;
            const questions = [
                "Should the death penalty be abolished?",
                "Is climate change largely caused by human activities?",
                "Should marijuana be legalized?",
                "Is universal healthcare a fundamental human right?",
                "Should same-sex marriage be legalized worldwide?",
                "Is gun control an effective way to control crime?",
                "Should abortion be legal?",
                "Is animal testing necessary for human health advancements?",
                "Should countries have the right to possess nuclear weapons?",
                "Is the wage gap a myth?",
                "Should euthanasia be legal?",
                "Is censorship ever justified?",
                "Should voting be mandatory?",
                "Is the death penalty an effective deterrent to crime?",
                "Should governments regulate social media?",
                "Is privacy more important than security?",
                "Should education be free for everyone?",
                "Is affirmative action fair?",
                "Should vaccinations be mandatory?",
                "Is the war on drugs effective?",
                "Should prostitution be legalized?",
                "Is the electoral college an outdated system?",
                "Should college athletes be paid?",
                "Is the two-party system effective?",
                "Should the drinking age be lowered?",
                "Is the right to bear arms outdated?",
                "Should the government regulate fast food?",
                "Is homeschooling as effective as traditional schooling?",
                "Should the government provide a universal basic income?",
                "Is the death penalty morally acceptable?",
                "Should the government regulate the internet?",
                "Is the use of drones ethical?",
                "Should the government be able to access personal data?",
                "Is the cost of college too high?",
                "Should the government fund space exploration?",
                "Is the use of standardized tests improving education?",
                "Should the government provide child care?",
                "Should the government increase minimum wage?",
                "Is the use of surveillance cameras in public places an invasion of privacy?",
                "Should the government regulate artificial intelligence?",
                "Is the use of genetically modified food good for our health?",
                "Should the government provide free internet service?",
                "Is the use of animals for scientific research ethical?",
                "Should the government regulate the use of human genetic engineering?",
                "Is the use of renewable energy sources economically feasible?",
                "Should the government provide free healthcare?",
                "Is the use of nuclear energy safe?",
                "Should the government regulate online content?",
                "Is the use of social media beneficial to society?",
                "Should the government regulate the use of autonomous cars?",
                "If you put 1 lasagna on top of another 1, do you have 1 or 2 lasagna?"
            ];
            const answer = questions[Math.floor(Math.random() * questions.length)];
            res.json({ answer });
        }
        catch (error) {
            console.error(error);
            res.status(500).send('Error occurred while fetching data');
        }
    }));
    /// ------- logic for webrtc connection ------
    // on ice send
    socket.on('ice:send', ({ candidate }) => {
        let type = (0, lib_1.getType)(socket.id, roomArr);
        if (type) {
            if ((type === null || type === void 0 ? void 0 : type.type) == 'p1') {
                typeof (type === null || type === void 0 ? void 0 : type.p2id) == 'string'
                    && io.to(type.p2id).emit('ice:reply', { candidate, from: socket.id });
            }
            else if ((type === null || type === void 0 ? void 0 : type.type) == 'p2') {
                typeof (type === null || type === void 0 ? void 0 : type.p1id) == 'string'
                    && io.to(type.p1id).emit('ice:reply', { candidate, from: socket.id });
            }
        }
    });
    // on sdp send
    socket.on('sdp:send', ({ sdp }) => {
        let type = (0, lib_1.getType)(socket.id, roomArr);
        if (type) {
            if ((type === null || type === void 0 ? void 0 : type.type) == 'p1') {
                typeof (type === null || type === void 0 ? void 0 : type.p2id) == 'string'
                    && io.to(type.p2id).emit('sdp:reply', { sdp, from: socket.id });
            }
            if ((type === null || type === void 0 ? void 0 : type.type) == 'p2') {
                typeof (type === null || type === void 0 ? void 0 : type.p1id) == 'string'
                    && io.to(type.p1id).emit('sdp:reply', { sdp, from: socket.id });
            }
        }
    });
    /// --------- Messages -----------
    // send message
    socket.on("send-message", (input, type, roomid) => {
        if (type == 'p1')
            type = 'You: ';
        else if (type == 'p2')
            type = 'Stranger: ';
        socket.to(roomid).emit('get-message', input, type);
    });
});
