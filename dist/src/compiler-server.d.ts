import type { NextFunction, Request, Response } from 'express';
export declare function resolve(rootDir: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
