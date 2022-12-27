import request from 'supertest';
import { server } from '../src';
import { User } from '../src/app/entity/user';

const app = request(server);

describe('Scenario #1 - all operations in a positive case', () => {
  afterAll(() => {
    server.close();
  });

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
    expect(response.body.find((item: User) => item.id === createdUserId)).toBeTruthy();
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
    const user = { username: 'User', age: 30, hobbies: ['postcrossing', 'reading'] };
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
    // expect(response.statusCode).toBe(404);
  });
});
