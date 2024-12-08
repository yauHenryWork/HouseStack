import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoClient, ObjectId } from 'mongodb';
import * as dotenv from 'dotenv';

@Injectable()
export class NotesService {
  private readonly mongoUrl = process.env.MONGO_URL; // Replace with your MongoDB URL
  private readonly dbName = process.env.DB_NAME; // Replace with your database name
  private client: MongoClient;

  private async getCollection() {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUrl);
      await this.client.connect();
    }
    return this.client.db(this.dbName).collection('notes');
  }

  // Create a note
  async create(note: { title: string; content: string; createdAt?: Date }) {
    const collection = await this.getCollection();
    const result = await collection.insertOne({
      ...note,
      createdAt: note.createdAt || new Date(),
    });
    return { id: result.insertedId, ...note };
  }

  // Retrieve all notes
  async findAll() {
    this.client = new MongoClient(this.mongoUrl);
    await this.client.connect();
    const collection = this.client.db(this.dbName).collection('notes');
    try {
      const tasks = await collection.find({}).toArray();
      
      return collection.find().toArray();
      } catch (err) {
      console.error("Error fetching tasks:", err);
      return  { title: 'Home Page', tasks: [], error: 'Error fetching tasks' };
  }
  }

  // Update a note by ID
  async update(id: string, note: { title: string; content: string }) {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: note },
      { returnDocument: 'after' },
    );
    if (!result.value) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }
    return result.value;
  }

  // Delete a note by ID
  async delete(id: string) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Note with ID "${id}" not found`);
    }
    return { message: `Note with ID "${id}" deleted successfully` };
  }
}