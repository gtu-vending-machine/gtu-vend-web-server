/* eslint-disable @typescript-eslint/indent */
import express from 'express';
import { prisma } from '../../prismaClient';
import ErrorResponse from '../../interfaces/ErrorResponse';
import { Product } from '@prisma/client';
import {
  CreateProductRequest,
  UpdateProductRequest,
} from '../../interfaces/Product';
import {
  failedToCreate,
  failedToDelete,
  failedToFetch,
  failedToUpdate,
  missingFields,
} from '../../utils/errorMessages';
import verifyRole from '../../middlewares/verifyRole';
import { QueryRequest } from '../../interfaces/Filter';
import { getWhereClause } from '../../utils/getWhereClause';

const productsRouter = express.Router();

productsRouter.get<{}, Product[] | [] | ErrorResponse>(
  '/',
  async (req, res, next) => {
    try {
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      });
      return res.json(products);
    } catch (error) {
      console.error(error);
      next(error);

      return failedToFetch('products', error);
    }
  },
);

productsRouter.get<{ id: string }, Product | null | ErrorResponse>(
  '/:id',
  async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    try {
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      });

      return res.json(product);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToFetch('product', error);
    }
  },
);

interface ProductResponseWithCount {
  products: Product[];
  _count: number;
}

productsRouter.post<{}, ProductResponseWithCount | [] | ErrorResponse>(
  '/query',
  async (req: QueryRequest<Product>, res, next) => {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json(missingFields(['query']));
    }

    const { filter, pagination, sort } = query;
    const fields: (keyof Product)[] = ['id', 'name', 'price', 'image'];

    // get where clause for filtering
    const whereClause = getWhereClause<Product>(filter, fields);

    // Handle pagination logic
    const { page = 1, pageSize = 5 } = pagination || {}; // Set defaults
    const skip = (page - 1) * pageSize; // Calculate skip offset

    // get products and count

    await prisma.product
      .findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
        orderBy: sort
          ? {
              [sort.field]: sort.order,
            }
          : undefined,
        skip,
        take: pageSize,
      })
      .then((products) => {
        prisma.product
          .count({
            where: whereClause,
          })
          .then((count) => {
            res.json({ products, _count: count });
          });
      })
      .catch((error) => {
        console.error(error);
        next(error);
        return failedToFetch('products', error);
      });
  },
);

// create a new product
productsRouter.post<{}, Product | ErrorResponse>(
  '/',
  verifyRole(['admin']),
  async (req, res, next) => {
    const { image, name, price } = req.body as CreateProductRequest;

    if (name === undefined || price === undefined) {
      return res.status(400).json(missingFields(['name', 'price']));
    }

    try {
      const product = await prisma.product.create({
        data: {
          name,
          price,
          image,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      });

      return res.json(product);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToCreate('product', error);
    }
  },
);

// update an existing product
productsRouter.put<{ id: string }, Product | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);

    // each field is optional, so no need to check for missing fields
    const { image, name, price } = req.body as UpdateProductRequest;

    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    try {
      const product = await prisma.product.update({
        where: { id: id },
        data: {
          name,
          price,
          image,
        },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      });

      return res.json(product);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToUpdate('product', error);
    }
  },
);

// delete a product
productsRouter.delete<{ id: string }, Product | ErrorResponse>(
  '/:id',
  verifyRole(['admin']),
  async (req, res, next) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json(missingFields(['id']));
    }

    try {
      const product = await prisma.product.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      });

      return res.json(product);
    } catch (error) {
      console.error(error);
      next(error);
      return failedToDelete('product', error);
    }
  },
);

export default productsRouter;
