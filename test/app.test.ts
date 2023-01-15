import request from 'supertest';
import { server } from '../src';
import { User } from '../src/app/entity/user';
import { v4 as uuidv4, v4, validate } from 'uuid';
import { ErrorMessage } from '../src/app/constants';

const app = request(server);

afterAll(() => {
  server.close();
});

describe('Scenario #1 - all operations in a positive case', () => {
  it('should return empty array for the first GET /api/users request', async () => {
    const response = await app.get('/api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  let createdUserId: string;

  it('should return new created user for the POST /api/users request', async () => {
    const user = { username: 'User', age: 20, hobbies: ['postcrossing'] };
    const response = await app.post('/api/users').send(user);

    expect(response.statusCode).toBe(201);
    expect(response.body.age).toBe(20);
    expect(response.body.username).toBe('User');
    expect(response.body.hobbies.length).toBe(1);
    expect(response.body.hobbies.includes('postcrossing')).toBe(true);

    createdUserId = response.body.id;
  });

  it('should return array with corresponding data after POST request for the GET /api/users request', async () => {
    const response = await app.get('/api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    expect(
      response.body.find((item: User) => item.id === createdUserId)
    ).toBeTruthy();
  });

  it('should return corresponding user data for the GET /api/users/:id request', async () => {
    const response = await app.get('/api/users/' + createdUserId);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(createdUserId);
    expect(response.body.username).toBe('User');
    expect(response.body.hobbies.length).toBe(1);
    expect(response.body.hobbies.includes('postcrossing')).toBe(true);
  });

  it('shoud return array with corresponding data after the PUT /api/users/:id request', async () => {
    const user = {
      username: 'User',
      age: 30,
      hobbies: ['postcrossing', 'reading'],
    };
    const response = await app.put('/api/users/' + createdUserId).send(user);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(createdUserId);
    expect(response.body.age).toBe(30);
    expect(response.body.username).toBe('User');
    expect(response.body.hobbies.length).toBe(2);
    expect(response.body.hobbies.includes('postcrossing')).toBe(true);
    expect(response.body.hobbies.includes('reading')).toBe(true);
  });

  it('shoud return corresponding user data after PUT request for the GET /api/users/:id request', async () => {
    const response = await app.get('/api/users/' + createdUserId);

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(createdUserId);
    expect(response.body.age).toBe(30);
    expect(response.body.username).toBe('User');
    expect(response.body.hobbies.length).toBe(2);
    expect(response.body.hobbies.includes('postcrossing')).toBe(true);
    expect(response.body.hobbies.includes('reading')).toBe(true);
  });

  it('shoud delete corresponding user for the the DELETE /api/users/:id request', async () => {
    const response = await app.delete('/api/users/' + createdUserId);

    expect(response.statusCode).toBe(204);

    const response2 = await app.get('/api/users/' + createdUserId);
    expect(response2.statusCode).toBe(404);
  });
});

describe('Scenario #2 - user with specified id does not exist', () => {
  it('should return new created user for the POST /api/users request', async () => {
    const user = { username: 'User', age: 20, hobbies: ['postcrossing'] };
    const response = await app.post('/api/users').send(user);

    expect(response.statusCode).toBe(201);
    expect(response.body.age).toBe(20);
    expect(response.body.username).toBe('User');
    expect(response.body.hobbies.length).toBe(1);
    expect(response.body.hobbies.includes('postcrossing')).toBe(true);
  });

  const noExistId = v4();
  it('should return 404 and corresponding message if user does not exist for the GET request', async () => {
    const response = await app.get('/api/users/' + noExistId);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(ErrorMessage.USER_NOT_FOUND);
  });

  it('should return 404 and corresponding message if user does not exist for the PUT request', async () => {
    const user = {
      username: 'User',
      age: 30,
      hobbies: ['postcrossing', 'reading'],
    };
    const response = await app.put('/api/users/' + noExistId).send(user);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(ErrorMessage.USER_NOT_FOUND);
  });

  it('should return 404 and corresponding message if user does not exist for the DELETE request', async () => {
    const response = await app.delete('/api/users/' + noExistId);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(ErrorMessage.USER_NOT_FOUND);
  });
});

describe('Scenario #3 - validate input data', () => {
  const invalidId = v4().slice(1);

  it('should return array for the GET /api/users request', async () => {
    const response = await app.get('/api/users');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it('should return 400 and corresponding message if userId is invalid for the GET request', async () => {
    const response = await app.get('/api/users/' + invalidId);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(ErrorMessage.INVALID_DATA);
  });

  it('should return 400 and corresponding message if userId is invalid for the PUT request', async () => {
    const user = {
      username: 'User',
      age: 30,
      hobbies: ['postcrossing', 'reading'],
    };
    const response = await app.put('/api/users/' + invalidId).send(user);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(ErrorMessage.INVALID_DATA);
  });

  it('should return 400 and corresponding message if userId is invalid for the DELETE request', async () => {
    const response = await app.delete('/api/users/' + invalidId);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(ErrorMessage.INVALID_DATA);
  });

  it('should return 400 and corresponding message if POST request body does not contain required fields', async () => {
    const user1 = { username: 'User', age: 30 };
    const user2 = { username: 'User', hobbies: ['postcrossing', 'reading'] };
    const user3 = { age: 30, hobbies: ['postcrossing', 'reading'] };

    const response1 = await app.put('/api/users/' + invalidId).send(user1);
    expect(response1.statusCode).toBe(400);
    expect(response1.body.message).toBe(ErrorMessage.INVALID_DATA);

    const response2 = await app.put('/api/users/' + invalidId).send(user2);
    expect(response2.statusCode).toBe(400);
    expect(response2.body.message).toBe(ErrorMessage.INVALID_DATA);

    const response3 = await app.put('/api/users/' + invalidId).send(user3);
    expect(response3.statusCode).toBe(400);
    expect(response3.body.message).toBe(ErrorMessage.INVALID_DATA);
  });

  it('should return 404 and corresponding human-friendly message in case of requests to non-existing endpoints', async () => {
    const response1 = await app.get('/api/user');
    expect(response1.statusCode).toBe(404);
    expect(response1.body.message).toBe(ErrorMessage.RESOURSE_NOT_FOUND);

    // const response2 = await app.post('/api/users/path');
    // expect(response2.statusCode).toBe(404);
    // expect(response2.body).toBe(ErrorMessage.RESOURSE_NOT_FOUND);
  });
});
