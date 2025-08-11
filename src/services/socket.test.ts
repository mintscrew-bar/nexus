import { io } from 'socket.io-client';

jest.mock('socket.io-client', () => {
  const mSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    auth: {},
  };
  return {
    io: jest.fn(() => mSocket),
  };
});

describe('SocketService', () => {
  let socketService: any;
  const mockIo = io as jest.Mock;
  let mockSocket: any;

  beforeEach(() => {
    jest.resetModules();
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      auth: {},
    };
    (io as jest.Mock).mockImplementation(() => mockSocket);
    socketService = require('./socket').default;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not connect if no token is present', () => {
    localStorage.removeItem('token');
    socketService.connect();
    expect(io).not.toHaveBeenCalled();
  });

  it('should connect with a token', () => {
    localStorage.setItem('token', 'test-token');
    socketService.setToken('test-token');
    socketService.connect();
    expect(io).toHaveBeenCalledWith('http://localhost:5000', expect.any(Object));
  });

  it('should disconnect the socket', () => {
    localStorage.setItem('token', 'test-token');
    socketService.setToken('test-token');
    socketService.connect();
    socketService.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should join a game chat', () => {
    localStorage.setItem('token', 'test-token');
    socketService.setToken('test-token');
    socketService.connect();
    socketService.joinGameChat(123);
    expect(mockSocket.emit).toHaveBeenCalledWith('custom-game:join', { gameId: 123 });
  });

  it('should send a game message', () => {
    localStorage.setItem('token', 'test-token');
    socketService.setToken('test-token');
    socketService.connect();
    socketService.sendGameMessage(123, 'hello');
    expect(mockSocket.emit).toHaveBeenCalledWith('game:chat', { gameId: 123, message: 'hello' });
  });
});