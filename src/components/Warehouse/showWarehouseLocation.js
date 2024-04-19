import {
  TextInput,
  Grid,
  Button,
  ScrollArea,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useViewportSize } from "@mantine/hooks";

import Map from "components/utilities/Map";




export default function ShowWarehouseLocation({ location }) {
  const { height } = useViewportSize();

  return (
    <>
      <ScrollArea style={{ height: height / 1.5 }} type="auto" offsetScrollbars>
        <ScrollArea style={{ height: "auto" }}>
          <Map location={location} />
        </ScrollArea>
      </ScrollArea>
    </>
  );
}
