#!/usr/bin/env node

import { App } from "aws-cdk-lib";
import { StackFactory } from "./Application/StackFactory";
import { StackSettingsProvider } from "./Infrastructure/StackSettingsProvider";
import { AwsCdkAdapter } from "./Infrastructure/AwsCdkAdapter";
import { FileSystemAdapter } from "./Infrastructure/FileSystemAdapter";

const app = new App();
const fsAdapter = new FileSystemAdapter();
const cdkAdapter = new AwsCdkAdapter(fsAdapter);
const settingsProvider = new StackSettingsProvider();
const config = settingsProvider.getConfig();
const stackFactory = new StackFactory(app, config, cdkAdapter);

stackFactory.create(config);
