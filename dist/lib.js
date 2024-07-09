"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getType = exports.handleDisconnect = exports.handleStart = void 0;
const uuid_1 = require("uuid");
function fetchRandomQuestion() {
    const questions = [
        "Is the use of social media beneficial to society?",
        "Should the government regulate the use of autonomous cars?",
        "If you put 1 lasagna on top of another 1, do you have 1 or 2 lasagna?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
}
function handleStart(roomArr, socket, cb, io) {
    let question = fetchRandomQuestion();
    // check available rooms
    let availableroom = checkAvailableRoom();
    if (availableroom.is) {
        socket.join(availableroom.roomid);
        cb('p2');
        closeRoom(availableroom.roomid);
        if (availableroom === null || availableroom === void 0 ? void 0 : availableroom.room) {
            io.to(availableroom.room.p1.id).emit('remote-socket', socket.id);
            socket.emit('remote-socket', availableroom.room.p1.id);
            socket.emit('roomid', availableroom.room.roomid);
            socket.emit('question', availableroom.room.question); // Emit the question to the second player
        }
    }
    // if no available room, create one
    else {
        let roomid = (0, uuid_1.v4)();
        socket.join(roomid);
        roomArr.push({
            roomid,
            isAvailable: true,
            question,
            p1: {
                id: socket.id,
            },
            p2: {
                id: null,
            }
        });
        cb('p1');
        socket.emit('roomid', roomid);
        socket.emit('question', question); // Emit the question to the first player
    }
    /**
     *
     * @param roomid
     * @desc search though roomArr and
     * make isAvailable false, also se p2.id
     * socket.id
     */
    function closeRoom(roomid) {
        for (let i = 0; i < roomArr.length; i++) {
            if (roomArr[i].roomid == roomid) {
                roomArr[i].isAvailable = false;
                roomArr[i].p2.id = socket.id;
                break;
            }
        }
    }
    /**
     *
     * @returns Object {is, roomid, room}
     * is -> true if foom is available
     * roomid -> id of the room, could be empth
     * room -> the roomArray, could be empty
     */
    function checkAvailableRoom() {
        for (let i = 0; i < roomArr.length; i++) {
            if (roomArr[i].isAvailable) {
                return { is: true, roomid: roomArr[i].roomid, room: roomArr[i] };
            }
            if (roomArr[i].p1.id == socket.id || roomArr[i].p2.id == socket.id) {
                return { is: false, roomid: "", room: null };
            }
        }
        return { is: false, roomid: '', room: null };
    }
}
exports.handleStart = handleStart;
/**
 * @desc handels disconnceition event
 */
function handleDisconnect(disconnectedId, roomArr, io) {
    for (let i = 0; i < roomArr.length; i++) {
        if (roomArr[i].p1.id == disconnectedId) {
            io.to(roomArr[i].p2.id).emit("disconnected");
            if (roomArr[i].p2.id) {
                roomArr[i].isAvailable = true;
                roomArr[i].p1.id = roomArr[i].p2.id;
                roomArr[i].p2.id = null;
            }
            else {
                roomArr.splice(i, 1);
            }
        }
        else if (roomArr[i].p2.id == disconnectedId) {
            io.to(roomArr[i].p1.id).emit("disconnected");
            if (roomArr[i].p1.id) {
                roomArr[i].isAvailable = true;
                roomArr[i].p2.id = null;
            }
            else {
                roomArr.splice(i, 1);
            }
        }
    }
}
exports.handleDisconnect = handleDisconnect;
// get type of person (p1 or p2)
function getType(id, roomArr) {
    for (let i = 0; i < roomArr.length; i++) {
        if (roomArr[i].p1.id == id) {
            return { type: 'p1', p2id: roomArr[i].p2.id };
        }
        else if (roomArr[i].p2.id == id) {
            return { type: 'p2', p1id: roomArr[i].p1.id };
        }
    }
    return false;
}
exports.getType = getType;
