import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [NotesModule, MongooseModule.forRoot('mongodb+srv://yauhenrywork:lEQNJ6TMmkl1gbyh@cluster0.eqlvw.mongodb.net/notes-db?retryWrites=true&w=majority')],
})
export class AppModule {}
