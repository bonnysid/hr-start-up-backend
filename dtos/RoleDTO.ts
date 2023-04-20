class RoleDTO {
  value: string;
  id: string;

  constructor(model: any) {
    this.id = model.id;
    this.value = model.value;
  }
}

export default RoleDTO;
