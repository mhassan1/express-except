import { Express, Router, RouterOptions } from 'express'
declare module 'express' {
  export interface Express {
    useExcept: Express['use']
    allExcept: Express['all']
    getExcept: Express['get']
    postExcept: Express['post']
    putExcept: Express['put']
    deleteExcept: Express['delete']
    patchExcept: Express['patch']
    optionsExcept: Express['options']
    headExcept: Express['head']
  }
  export interface Application {
    useExcept: Application['use']
    allExcept: Application['all']
    getExcept: Application['get']
    postExcept: Application['post']
    putExcept: Application['put']
    deleteExcept: Application['delete']
    patchExcept: Application['patch']
    optionsExcept: Application['options']
    headExcept: Application['head']
  }
  export interface Router {
    useExcept: Router['use']
    allExcept: Router['all']
    getExcept: Router['get']
    postExcept: Router['post']
    putExcept: Router['put']
    deleteExcept: Router['delete']
    patchExcept: Router['patch']
    optionsExcept: Router['options']
    headExcept: Router['head']
  }
  export function Router(options?: RouterOptions): Router;
  export default function(): Express
}
