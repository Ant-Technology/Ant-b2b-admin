import { Card } from "@mantine/core";
import MapView from "components/Dashboard/mapView";
import StatsGrid from "components/Dashboard/StatGrid";

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
  return (
    <>
      <div style={{}}>
        <StatsGrid datas={data} />
        <div style={{ width: "96%", marginLeft: 40 }}>
          <Card shadow="sm" p="lg">
            {/* <Calander /> */}

            <MapView />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
