import type {
  ComputeEnv,
  Pipeline,
  Pkg,
  PkgNode,
  PkgNodeDefaultParameter,
} from "../api/types";

export enum Role {
  Guest = "a guest",

  Clinician = "a clinician",
  Researcher = "a researcher",
  Admin = "an admin",

  DefaultRole = Guest,
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export enum PkgNodeOperation {
  ChildNode = "childNode",
  ChildPipeline = "childPipeline",
  GraphNode = "graphNode",
  DeleteNode = "deleteNode",
}

export type PipelineInfo = {
  pipeline: Pipeline;
  parameters: PkgNodeDefaultParameter[];
  pkgNodes: PkgNode[];
  pkgs: Pkg[];
};

export type ComputeEnvByNameMap = { [name: string]: ComputeEnv };

export enum PipelineOperation {
  SetPipeline,
  SetComputeEnv,
  SetActiveNode,
  ChangeComputeEnv,
  SetAllComputeEnv,
  ChangeTitle,
  PipelineToAdd,
  PipelineToDelete,
  Reset,
}
