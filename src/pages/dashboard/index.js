import { Card, Select } from "@mantine/core";
import MapView from "components/Dashboard/mapView";
import StatsGrid from "components/Dashboard/StatGrid";
import { useState } from "react";
import SalesDashboard from "components/Dashboard/report";
const DistributerIcon = {
  url: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/40/000000/external-distributor-sales-flaticons-lineal-color-flat-icons.png",
};

const RetailerIcon = {
  url: "https://img.icons8.com/external-filled-outline-wichaiwi/40/000000/external-Retailer-business-filled-outline-wichaiwi.png",
};

const WarehouseIcon = {
  url: "https://img.icons8.com/external-xnimrodx-lineal-color-xnimrodx/40/000000/external-warehouse-distribution-xnimrodx-lineal-color-xnimrodx-2.png",
};
const data = [
  {
    title: "Orders",
    icon: "receipt",
    value: "",
    diff: 34,
  },
  {
    title: "Shipments",
    icon: "coin",
    value: "",
    diff: 13,
  },
  {
    title: "Total Sales",
    icon: "discount",
    value: "",
    diff: 18,
  },
  {
    title: "Total Active Products",
    icon: "user",
    value: "188",
    diff: -6,
  },
];

const Dashboard = () => {
  const [value, setValue] = useState(null);

  const handleChange = (value) => {
    setValue(value);
  };
  return (
  
      <div style={{}}>
        <StatsGrid datas={data} />
        <SalesDashboard/>
        <div style={{ width: "96%", marginLeft: 40 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{marginRight:"15px"}}>
              <img
                src={RetailerIcon.url}
                alt="Retailer"
                style={{width: '24px', verticalAlign: "middle" }}
              />
              <span style={{ marginLeft: "5px" }}>Retailer</span>
            </div>
            <div style={{marginRight:"15px"}}>
              <img
                src={DistributerIcon.url}
                alt="Distributor"
                style={{width: '24px', verticalAlign: "middle" }}
              />
              <span style={{ marginLeft: "5px" }}>Distributor</span>
            </div>
            <div style={{marginRight:"15px"}}>
              <img
                src={WarehouseIcon.url}
                alt="Warehouse"
                style={{width: '24px', verticalAlign: "middle" }}
              />
              <span style={{ marginLeft: "5px" }}>Warehouse</span>
            </div>
            <Select
              placeholder="Pick value"
              data={["Distributor", "Warehouse", "Retailer"]}
              value={value}
              onChange={handleChange}
              clearable
              style={{ width: 200 }}
            />
          </div>
          <Card shadow="sm" p="lg">
            {/* <Calander /> */}

            <MapView value={value} />
          </Card>
        </div>
      </div>
  );
};

export default Dashboard;
