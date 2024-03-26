import {
  TextInput,
  Grid,
  Stack,
  Button,
  Textarea,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { MANAGE_STOCK } from "apollo/mutuations";
import { customLoader } from "components/utilities/loader";
import { GET_STOCKS } from "apollo/queries";

const ManageStock = ({
  editId,
  setOpenedEdit,
  total,
  setTotal,
  activePage,
  setActivePage,
  fetchData,
}) => {
  const form = useForm({
    initialValues: {
      quantity: null,
      reason: "",
      type: null,
    },
  });

  const [manageStock, { loading: manageStockLoading }] =
    useMutation(MANAGE_STOCK);

  const submit = () => {
    manageStock({
      variables: {
        stock_id: editId,
        type: form.values.type,
        reason: form.values.reason,
        quantity: parseInt(form.values.quantity),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Stock Managed Successfully",
        });
        fetchData(activePage);
        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setTypeDropDownValue = (val) => {
    form.setFieldValue("type", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={manageStockLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <form onSubmit={form.onSubmit(() => submit())}>
        <Stack>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                required
                type="number"
                label="Quantity"
                placeholder="Quantity"
                {...form.getInputProps("quantity")}
              />
              <Textarea
                placeholder="Your reason"
                label="Your reason"
                required
                {...form.getInputProps("reason")}
              />
              <Select
                data={[
                  { label: "RELEASE", value: "RELEASE" },
                  { label: "HOLD", value: "HOLD" },
                  { label: "MOVE", value: "MOVE" },
                  { label: "ADD", value: "ADD" },
                  { label: "REMOVE", value: "REMOVE" },
                ]}
                value={form.getInputProps("type")?.value}
                onChange={setTypeDropDownValue}
                label="Type"
                placeholder="Pick a type"
                searchable
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={12}>
              <Button type="submit" color="blue" variant="outline" fullWidth>
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </>
  );
};

export default ManageStock;
