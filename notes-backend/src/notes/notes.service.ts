import { Injectable , NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './note.schema';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
  ) {}

  async create(createNoteDto: { title: string; content: string }): Promise<Note> {
    const createdNote = new this.noteModel(createNoteDto);
    return createdNote.save();
  }

  async findAll(): Promise<Note[]> {
    return this.noteModel.find().exec();
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }
    return note;
  }

  async update(
    id: string,
    updateNoteDto: { title: string; content: string },
  ): Promise<Note> {
    const updatedNote = await this.noteModel
      .findByIdAndUpdate(id, updateNoteDto, { new: true, runValidators: true })
      .exec();

    if (!updatedNote) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return updatedNote;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.noteModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return { message: 'Note deleted successfully' };
  }
}