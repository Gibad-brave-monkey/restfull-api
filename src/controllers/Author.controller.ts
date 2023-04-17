import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import AuthorModels, { IAuthor } from "../models/Author.models";

const createAuthor = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  const author = new AuthorModels({
    _id: new mongoose.Types.ObjectId(),
    name,
  });

  return author
    .save()
    .then((author: IAuthor) => res.status(200).json({ author }))
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    });
};

const readAuthor = (req: Request, res: Response, next: NextFunction) => {
  const authorId = req.params.authorId;

  return AuthorModels.findById(authorId)
    .then((author) =>
      author
        ? res.status(200).json({ author })
        : res.status(404).json({ message: "Not Found" })
    )
    .catch((err) => {
      {
        if (err instanceof Error) {
          res.status(500).json({ message: err.message });
        }
      }
    });
};

const readAll = (req: Request, res: Response, next: NextFunction) => {
  return AuthorModels.find()
    .then((authors) => res.status(200).json({ authors }))
    .catch((err) => {
      if (err instanceof Error) {
        res.status(500).json({ message: err.message });
      }
    });
};

const updateAuthor = (req: Request, res: Response, next: NextFunction) => {
  const authorId = req.params.authorId;

  return AuthorModels.findById(authorId).then((author) => {
    if (author) {
      author.set(req.body);

      return author
        .save()
        .then((author) => res.status(201).json({ author }))
        .catch((err) => {
          if (err instanceof Error) {
            res.status(500).json({ message: err.message });
          }
        });
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  });
};

const deleteAuthor = (req: Request, res: Response, next: NextFunction) => {
  const authorId = req.params.authorId;

  return AuthorModels.findByIdAndDelete(authorId)
    .then((author) => {
      author
        ? res.status(201).json({ message: "deleted" })
        : res.status(404).json({ message: "Not Found" });
    })
    .catch((error) => {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      }
    });
};

export default {
  createAuthor,
  readAll,
  readAuthor,
  updateAuthor,
  deleteAuthor,
};
