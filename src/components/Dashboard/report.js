import React, { useEffect, useState } from "react";
import { Container, Grid } from "@mantine/core";

import { TopRetailers } from "./topRetailers";
import { TopDrivers } from "./topDriver";
import { TopProducts } from "./topProducts";

const SalesDashboard = () => (
  <Container style={{marginTop:"10px"}}>
    <Grid>
    <Grid.Col span={4}>
        <TopDrivers />
      </Grid.Col>
      <Grid.Col span={4}>
        <TopRetailers />
      </Grid.Col>
      <Grid.Col span={4}>
        <TopProducts />
      </Grid.Col>
    </Grid>
  </Container>
);

export default SalesDashboard;
