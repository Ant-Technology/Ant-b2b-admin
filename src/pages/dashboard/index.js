import { Card } from "@mantine/core";
import MapView from "components/Dashboard/mapView";
import StatsGrid from "components/Dashboard/StatGrid";

const data = [
  {
    title: "Orders",
    icon: "receipt",
    value: "1,456",
    diff: 34,
  },
  {
    title: "Shipments",
    icon: "coin",
    value: "4,145",
    diff: 13,
  },
  {
    title: "Total Sales",
    icon: "discount",
    value: "745,000 ETB",
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
        <StatsGrid data={data} />
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
