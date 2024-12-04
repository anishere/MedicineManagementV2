/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import { useRef, useState } from "react";
import { Button, Input, Space, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const MedicineTable = ({ listMedicine, getIDMedicine }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        { title: 'Mã', dataIndex: 'maThuoc', key: 'maThuoc', ...getColumnSearchProps('maThuoc') },
        { title: 'Tên', dataIndex: 'tenThuoc', key: 'tenThuoc', ...getColumnSearchProps('tenThuoc') },
        { title: 'Danh mục', dataIndex: 'maDanhMuc', key: 'maDanhMuc', ...getColumnSearchProps('maDanhMuc') },
        { title: 'Giá', dataIndex: 'giaBan', key: 'giaBan' },
        { title: 'Đơn vị', dataIndex: 'dvt', key: 'dvt' },
        { title: 'Kê Đơn', dataIndex: 'keDon', key: 'keDon', ...getColumnSearchProps('keDon') },
        { title: 'Số lượng', dataIndex: 'soLuongThuocCon', key: 'soLuongThuocCon' }, // Thêm cột Số lượng
        {
            title: 'Thêm',
            key: 'action',
            render: (record) => (
                <Button
                    type="primary"
                    onClick={() =>
                        getIDMedicine(record.maThuoc, record.tenThuoc, record.giaBan, record.soLuongThuocCon)
                    }
                >
                    Thêm
                </Button>
            ),
        },
    ];

    return <Table columns={columns} dataSource={listMedicine} rowKey="maThuoc" pagination={{ pageSize: 6 }} />;
};

export default MedicineTable;
