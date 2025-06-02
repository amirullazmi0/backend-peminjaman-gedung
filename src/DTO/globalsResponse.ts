export class WebResponse<T> {
  status?: Number
  success: Boolean
  message: any
  data?: T
  errors?: any
}
