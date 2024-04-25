#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const args = require("minimist")(process.argv.slice(2));

// make the first letters of the Word Uppercase
function titleCase(str) {
  const arr = str.split("");
  return arr[0].toUpperCase() + str.slice(1);
}

// Function to create dir
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
}

// Function to create a file
function createFile(targetDir, fileName, content) {
  const filePath = path.join(targetDir, fileName);

  // Check if the directory exists, if not create it
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Create file with the passed content
  fs.writeFileSync(filePath, content);
}

function createController(targetDir, moduleName) {
  const controllerFileName = `${moduleName}.controller.ts`;
  const controllerClassName = titleCase(moduleName) + "Controller";
  const serviceFileName = `${moduleName}.service.ts`;

  const content = `import { NextFunction, Request, Response } from 'express';
  
  import service from './${serviceFileName.slice(0, -3)}';
  
  import { HttpException } from '@/utils/exceptions/HttpException';

  export class ${controllerClassName} {
    private static instance: ${controllerClassName}

    private constructor() {}

    static getInstance() {
      if (!this.instance) {
        this.instance = new ${controllerClassName};
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
  `;
  createFile(targetDir, controllerFileName, content);
}

function createRouter(targetDir, moduleName) {
  const routeFileName = `${moduleName}.route.ts`;
  const controllerFileName = `${moduleName}.controller.ts`;

  const routeClassName = titleCase(moduleName) + "Route";
  const controllerClassName = titleCase(moduleName) + "Controller";

  const content = `import { Router } from 'express';
import { AbstractRouter } from '../../routes/v2/route.interface';

import { ${controllerClassName} } from './${controllerFileName.slice(0, -3)}';

export class ${routeClassName} extends AbstractRouter {
  private static instance: ${routeClassName};
  
  public router: Router;
  public controller: ${controllerClassName};

  private constructor() {
    super();
    this.router = Router();
    this.controller = ${controllerClassName}.getInstance();
    this.initializeRoutes();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ${routeClassName};
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

  export default ${routeClassName}.getInstance().getRoutes();

  `;
  createFile(targetDir, routeFileName, content);
}

function createService(targetDir, moduleName) {
  const serviceFileName = `${moduleName}.service.ts`;

  const serviceClassName = titleCase(moduleName) + "Service";

  const content = `export class ${serviceClassName} {
    private static instance: ${serviceClassName}

    private constructor() {}

    static getInstance() {
      if (!this.instance) {
        this.instance = new ${serviceClassName};
      }
      return this.instance;
    }

    // service methods
    async hello(id: string) {
      return {id}
    }
  }

  export default ${serviceClassName}.getInstance();

  `;
  createFile(targetDir, serviceFileName, content);
}

const rootDir = args._[0] || "defaultApp";

const repositories = "repositories";
const dtos = "dtos";
const interfaces = "interfaces";

if (!rootDir) {
  console.error("Usage: lb-module <directory-name>");
  process.exit(1);
}

const rootPath = path.join(process.cwd(), rootDir);
const repositoriesDirPath = path.join(rootPath, repositories);
const dtosDirPath = path.join(rootPath, dtos);
const interfacesDirPath = path.join(rootPath, interfaces);

// Create root directory if it doesn't exist
createDir(rootPath);

// Create repositories if it doesn't exist
createDir(repositoriesDirPath);
createFile(repositoriesDirPath, ".gitkeep", "");

// Create dtos if it doesn't exist
createDir(dtosDirPath);
createFile(dtosDirPath, ".gitkeep", "");

// create interfaces if it doesn't exist
createDir(interfacesDirPath);
createFile(interfacesDirPath, ".gitkeep", "");

// create the router
createRouter(rootPath, rootDir);

// create the controller
createController(rootPath, rootDir);

// create the service
createService(rootPath, rootDir);

console.log(`App Module ${rootDir} created in: ${rootPath}`);
