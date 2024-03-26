import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  TextInput,
  Stack,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_DRIVER } from "apollo/mutuations";
import { GET_DRIVERS, GET_REGIONS } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
// import Map from "components/utilities/Map";
import { useState } from "react";

export const DriverAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
  fetchData,
}) => {
  // state variables
  const [regionsDropDownData, setRegionsDropDownData] = useState([]);
  // state variable to handle map location
  // const [location, setLocation] = useState({});

  // form state
  const form = useForm({
    initialValues: {
      name: "",
      address: "",
      city: "",
      phone: "",
      _geo: "",
      region: {
        connect: "1",
      },
      user: {
        create: {
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        },
      },
    },
  });

  // mutation
  const [addDriver, { loading: driverLoading }] = useMutation(CREATE_DRIVER, {
    update(cache, { data: { createDriver } }) {},
  });

  // graphql queries
  const { loading: regionsLoading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let regions = data.regions;
      let regionsArray = [];

      // loop over regions data to structure the data for the use of drop down
      regions.data.forEach((region, index) => {
        regionsArray.push({
          label: region?.name,
          value: region?.id,
        });
      });

      // put it on the state
      setRegionsDropDownData([...regionsArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { height } = useViewportSize();

  const submit = () => {
    addDriver({
      variables: {
        name: form.getInputProps("name").value,

        city: form.getInputProps("city").value,
        region: form.getInputProps("region").value,
        phone: form.getInputProps("phone").value,
        address: form.getInputProps("address").value,
        email: form.getInputProps("user.create.email").value,
        password: form.getInputProps("user.create.password").value,
        password_confirmation: form.getInputProps(
          "user.create.password_confirmation"
        ).value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver Created Successfully",
        });
        fetchData(activePage);
        setOpened(false);
      },
      onError(error) {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Driver Not Created!",
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("region.connect", val);
  };

  return (
    <>
      <LoadingOverlay
        visible={regionsLoading || driverLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Name"
                  placeholder="Name"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  required
                  label="Address"
                  placeholder="Address"
                  {...form.getInputProps("address")}
                />
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
                />
                <Select
                  data={regionsDropDownData}
                  value={form.getInputProps("region.connect")?.value.toString()}
                  onChange={setRegionDropDownValue}
                  label="Region"
                  placeholder="Pick a region this retailer belongs to"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="User Name"
                  placeholder="User Name"
                  {...form.getInputProps("user.create.name")}
                />
                <TextInput
                  required
                  label="Email"
                  placeholder="Email"
                  {...form.getInputProps("user.create.email")}
                />
                <TextInput
                  required
                  label="Phone"
                  type="number"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
                />
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  // description="Password must include at least one letter, number and special character"
                  {...form.getInputProps("user.create.password")}
                />
                <PasswordInput
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  // description="Password must the samer"
                  {...form.getInputProps("user.create.password_confirmation")}
                />
              </Grid.Col>
            </Grid>
            {/* user */}

            {/* <Grid>
              <Grid.Col span={12}>
                <ScrollArea style={{ height: "auto" }}>
                  <Map setLocation={setLocation} />
                </ScrollArea>
              </Grid.Col>
            </Grid> */}

            <Grid>
              <Grid.Col span={12}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      </ScrollArea>
    </>
  );
};
