import { useState, useCallback } from 'react';

export default function () {
  const [openModal, setOpenModal] = useState<boolean>(false)
  // 打开免责声明对话框
  const handleDisclaimerOpen = useCallback(() =>  setOpenModal(true), []);
  //关闭免责声明对话框
  const handleDisclaimerClose = useCallback(() =>  setOpenModal(false), []);
  
  return { openModal, handleDisclaimerOpen, handleDisclaimerClose };
}