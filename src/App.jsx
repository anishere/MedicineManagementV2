import { Button, Flex, Layout } from 'antd';
import './App.css';
import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import CusHeader from './components/cusHeader';
import Dashboard from './components/dashboard';  // Component cho route Dashboard
import MedicineManagement from './components/medicineManagement';  // Component cho route Medicine
import AccountManagement from './components/accountManagement';
import CustomerManagement from './components/customerManagement';  // Component cho route Accounts
import EmployeeManagement from './components/employeeManagement';
import CategoryManagement from './components/categoryManagement';
import SupplierManagement from './components/supplierManagement';
import NotePersonal from './components/notePersonal';
import Personal from './components/personal';
import ImportManagement from './components/importManagement';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import SellMedicine from './components/sellMedicine';
import Login from './page/login'
import Invoices from './components/invoices';
import Setting from './components/setting';
import Chatcomponent from './components/chatcomponent';

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const { Sider, Header, Content } = Layout;

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    setIsLogin(localStorage.getItem("isLogin"));
  },[])

  return (
      ((isLogin && isLogin === 'true') ?
      <Layout>
        <Sider className='sider' theme='light' trigger={null} collapsible collapsed={collapsed}>
          <Sidebar />
        </Sider>

        <Button 
          type='text' 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={() => setCollapsed(!collapsed)}
          className='trigger-btn'
        />
        <Layout>
          <Header className='header'>
            <CusHeader />
          </Header>

          {/* Phần Content sẽ thay đổi theo route */}
          <Content className='content'>
            <Flex>
              <Routes>
                <Route path="/" element={<Dashboard />} /> {/* Mặc định là Dashboard */}
                <Route path="/medicineManagement" element={<MedicineManagement />} />
                <Route path="/sellMedicine" element={<SellMedicine />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/categoryManagement" element={<CategoryManagement />} />
                <Route path="/customerManagement" element={<CustomerManagement />} />
                <Route path="/accountManagement" element={<AccountManagement />} />
                <Route path="/employeeManagement" element={<EmployeeManagement />} />
                <Route path="/supplierManagement" element={<SupplierManagement />} />
                <Route path="/importManagement" element={<ImportManagement />} />
                <Route path="/notePersonal" element={<NotePersonal />} />
                <Route path="/personal" element={<Personal />} />
                <Route path="/chatcomponent" element={<Chatcomponent />} />
                <Route path="/settings" element={<Setting />} />
              </Routes>
            </Flex>
          </Content>
        </Layout>
        <ToastContainer />
      </Layout>
      : <Login/>
      )
  );
}

export default App;
