import { Modal } from 'antd';
import React from 'react';
const BaseModel = ({children,title,visible,onCancel}:any)=>{
return <Modal title={title} open={visible} footer={null} onCancel={onCancel}>
{children}
</Modal>
}
export default BaseModel;