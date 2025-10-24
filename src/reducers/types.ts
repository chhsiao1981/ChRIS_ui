export enum Role {
  Guest = "a guest",

  Clinician = "a clinician",
  Researcher = "a researcher",
  Admin = "an admin",

  DefaultRole = Guest,
}

export const Roles = [Role.Clinician, Role.Researcher];

export const StaffRoles = [Role.Clinician, Role.Researcher, Role.Admin];

export enum NodeOperation {
  ChildNode = "childNode",
  ChildPipeline = "childPipeline",
  GraphNode = "graphNode",
  DeleteNode = "deleteNode",
}
