# LinkBoss Module Generator
*Create a Single App module.*

## Initial Set Up
 1. Clone the Repo
 2. cd into it
 3. Run `npm install`
 3. Run `npm link`

## How to Use
 1. cd into the modules dir. For example: `cd src/apps`
 2. To create a new app called "moduleName" run `create-module moduleName` 

 ## This Will create
 1. repositories, dtos, interface dirs inside *src/apps/moduleName*
 2. A new file called *moduleName.route.ts*
 `
import { Router } from 'express';
import { AbstractRouter } from '../../routes/v2/route.interface';

import { NewModuleController } from './newModule.controller';

export class NewModuleRoute extends AbstractRouter {
  private static instance: NewModuleRoute;
  
  public router: Router;
  public controller: NewModuleController;

  private constructor() {
    super();
    this.router = Router();
    this.controller = NewModuleController.getInstance();
    this.initializeRoutes();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new NewModuleRoute;
    }
    return this.instance;
  }

    public getRoutes(): Router {
      return this.router;
    }

    protected initializeRoutes(): void {
      this.router.get('/hello', this.controller.hello);
    }
  }

  export default NewModuleRoute.getInstance().getRoutes();

 `

 3. A new file called *newModule.controller.ts*
 `
import { NextFunction, Request, Response } from 'express';
  
  import service from './newModule.service';
  
  import { HttpException } from '@/utils/exceptions/HttpException';

  export class NewModuleController {
    private static instance: NewModuleController

    private constructor() {}

    static getInstance() {
      if (!this.instance) {
        this.instance = new NewModuleController;
      }
      return this.instance;
    }

    // controller methods
    async hello(req: Request, res: Response, next: NextFunction) {
  
      try {
        const response = await service.hello('id');
        return res.status(200).json({
          ...response
        });
      } catch (error: unknown) {
        return next(
          new HttpException(
            400,
            (error as Error)?.message || 'Something went wrong',
          ),
        );
      }
    }
  }
  
 `
 4. A new file called *newModule.service.ts*
 `
export class NewModuleService {
    private static instance: NewModuleService

    private constructor() {}

    static getInstance() {
      if (!this.instance) {
        this.instance = new NewModuleService;
      }
      return this.instance;
    }

    // service methods
    async hello(id: string) {
      return {id}
    }
  }

  export default NewModuleService.getInstance();

 `
