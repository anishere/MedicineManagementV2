/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { axiosCus } from "../axios/axios";
import { URLListNote, URLCreateNote, URLUpdateNote, URLDeleteNote } from "../../URL/url";
import { Table, Button, Modal, Form, Input, message, Tag, Select, Popconfirm } from "antd";

const NotePersonal = () => {
    const idPersonal = localStorage.getItem("maNV"); // Lấy mã nhân viên từ localStorage
    const [listNotes, setListNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' hoặc 'edit'
    const [currentNote, setCurrentNote] = useState(null); // Lưu trữ ghi chú hiện tại được chỉnh sửa
    const [selectedNote, setSelectedNote] = useState(null); // Lưu trữ ghi chú được chọn để xem chi tiết
    const [form] = Form.useForm();

    // Lấy danh sách ghi chú
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await axiosCus.get(`${URLListNote}${idPersonal}`);
            if (response.statusCode === 200) {
                setListNotes(response.listNotePersonal || []);
            } else {
                message.warning(response.statusMessage);
            }
        } catch (error) {
            message.error("Lỗi khi tải danh sách ghi chú!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Tạo ghi chú mới
    const createNote = async (values) => {
        try {
            const payload = {
                idGhiChu: 0,
                maNV: idPersonal,
                tieuDe: values.tieuDe,
                noiDung: values.noiDung,
                ngayTao: new Date().toISOString(),
                hanChot: values.hanChot ? new Date(values.hanChot).toISOString() : null,
                trangThai: values.trangThai,
            };

            const response = await axiosCus.post(URLCreateNote, payload);
            if (response.statusCode === 200) {
                message.success(response.statusMessage);
                fetchNotes();
                setIsModalVisible(false);
                form.resetFields();
            } else {
                message.warning(response.statusMessage);
            }
        } catch (error) {
            message.error("Lỗi khi tạo ghi chú!");
        }
    };

    // Cập nhật ghi chú
    const updateNote = async (values) => {
        try {
            const payload = {
                idGhiChu: currentNote.idGhiChu,
                maNV: idPersonal,
                tieuDe: values.tieuDe,
                noiDung: values.noiDung,
                ngayTao: currentNote.ngayTao,
                hanChot: values.hanChot ? new Date(values.hanChot).toISOString() : null,
                trangThai: values.trangThai,
            };

            const response = await axiosCus.put(`${URLUpdateNote}${currentNote.idGhiChu}`, payload);
            if (response.statusCode === 200) {
                message.success('Cập nhật thành công');
                fetchNotes();
                setIsModalVisible(false);
                form.resetFields();
            } else {
                message.warning(response.statusMessage);
            }
        } catch (error) {
            message.error("Lỗi khi cập nhật ghi chú!");
        }
    };

    // Xóa ghi chú
    const handleDeleteNote = async (id) => {
        try {
            const response = await axiosCus.delete(`${URLDeleteNote}${id}`);
            if (response.statusCode === 200) {
                message.success("Xóa thành công");
                fetchNotes();
                if (selectedNote && selectedNote.idGhiChu === id) {
                    setSelectedNote(null);
                }
            } else {
                message.warning(response.statusMessage);
            }
        } catch (error) {
            message.error("Lỗi khi xóa ghi chú!");
        }
    };

    // Mở modal
    const openModal = (mode, note = null) => {
        setModalMode(mode);
        setCurrentNote(note);
        setIsModalVisible(true);

        if (note) {
            form.setFieldsValue({
                tieuDe: note.tieuDe,
                noiDung: note.noiDung,
                hanChot: note.hanChot ? new Date(note.hanChot).toISOString().split("T")[0] : null,
                trangThai: note.trangThai,
            });
        } else {
            form.resetFields();
        }
    };

    // Cột bảng
    const columns = [
        {
            title: "Tiêu đề",
            dataIndex: "tieuDe",
            key: "tieuDe",
        },
        {
            title: "Ngày tạo",
            dataIndex: "ngayTao",
            key: "ngayTao",
            render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "Không xác định"),
        },
        {
            title: "Hạn chót",
            dataIndex: "hanChot",
            key: "hanChot",
            render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "Không có"),
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            render: (status) => (
                <Tag color={status === "Hoàn thành" ? "green" : status === "Hết hạn" ? "orange" : "red"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_, record) => (
                <div className="d-flex gap-2">
                    <Button type="link" onClick={() => setSelectedNote(record)}>
                        Xem chi tiết
                    </Button>
                    <Button type="link" onClick={() => openModal("edit", record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa ghi chú này không?"
                        onConfirm={() => handleDeleteNote(record.idGhiChu)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="link" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    return (
        <div className="container mt-5">
            <h1 className="text-center">Quản lý ghi chú cá nhân</h1>
            <div className="d-flex justify-content-end mb-3">
                <Button type="primary" onClick={() => openModal("create")}>
                    Thêm ghi chú
                </Button>
            </div>
            <Table columns={columns} dataSource={listNotes} rowKey="idGhiChu" loading={loading} bordered />
            {selectedNote && (
                <div className="mt-4 p-3 border rounded bg-light">
                    <h4>Chi tiết ghi chú</h4>
                    <p>
                        <strong>Tiêu đề:</strong> {selectedNote.tieuDe}
                    </p>
                    <p>
                        <strong>Nội dung:</strong> {selectedNote.noiDung}
                    </p>
                    <p>
                        <strong>Ngày tạo:</strong> {new Date(selectedNote.ngayTao).toLocaleDateString("vi-VN")}
                    </p>
                    <p>
                        <strong>Hạn chót:</strong>{" "}
                        {selectedNote.hanChot ? new Date(selectedNote.hanChot).toLocaleDateString("vi-VN") : "Không có"}
                    </p>
                    <p>
                        <strong>Trạng thái:</strong>{" "}
                        <Tag
                            color={
                                selectedNote.trangThai === "Hoàn thành"
                                    ? "green"
                                    : selectedNote.trangThai === "Hết hạn"
                                    ? "orange"
                                    : "red"
                            }
                        >
                            {selectedNote.trangThai}
                        </Tag>
                    </p>
                </div>
            )}
            <Modal
                title={modalMode === "create" ? "Tạo ghi chú mới" : "Chỉnh sửa ghi chú"}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={modalMode === "create" ? createNote : updateNote} layout="vertical">
                    <Form.Item
                        name="tieuDe"
                        label="Tiêu đề"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="noiDung"
                        label="Nội dung"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="hanChot" label="Hạn chót">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item
                        name="trangThai"
                        label="Trạng thái"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
                    >
                        <Select>
                            <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
                            <Select.Option value="Chưa hoàn thành">Chưa hoàn thành</Select.Option>
                        </Select>
                    </Form.Item>
                    <div className="d-flex justify-content-end">
                        <Button onClick={() => setIsModalVisible(false)} className="me-2">
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {modalMode === "create" ? "Tạo mới" : "Cập nhật"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default NotePersonal;
