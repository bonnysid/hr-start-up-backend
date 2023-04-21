class RoleDTO {
  value: string;
  canDeleteEdit: boolean;
  id: string;

  constructor(model: any) {
    this.id = model.id;
    this.value = model.value;
    this.canDeleteEdit = model.canDeleteEdit;
  }
}

export default RoleDTO;
