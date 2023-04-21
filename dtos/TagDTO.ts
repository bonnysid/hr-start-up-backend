class TagDTO {
  value: string;
  id: string;
  canDeleteEdit: boolean;

  constructor(model: any) {
    this.id = model.id;
    this.value = model.value;
    this.canDeleteEdit = model.canDeleteEdit;
  }
}

export default TagDTO;
