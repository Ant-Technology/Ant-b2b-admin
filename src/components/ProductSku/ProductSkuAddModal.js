import {
  TextInput,
  Grid,
  Stack,
  Button,
  Checkbox,
  ScrollArea,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTS, GET_PRODUCT_SKUS } from "apollo/queries";
import { CREATE_PRODUCT_SKUS } from "apollo/mutuations";
import { customLoader } from "components/utilities/loader";

const ProductSkuAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
  fetchData,
  totalPages,
}) => {
  const [dropDownData, setDropDownData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();
  const [productAttrs, setProductAttrs] = useState();

  const form = useForm({
    initialValues: {
      sku: "",
      price: "",
      is_active: false,
      product: null,
      buy_price: "",
      variants: [],
    },
    validate: {
      price: (value) => {
        if (value === "") {
          return "Price is required";
        }
        if (isNaN(value)) {
          return "Price must be a valid number";
        }
        if (parseFloat(value) <= 0) {
          return "Price must be a positive number";
        }
        return null;
      },
      buy_price: (value) => {
        if (value === "") {
          return "Buy price is required";
        }
        if (isNaN(value)) {
          return "Buy price  must be a valid number";
        }
        if (parseFloat(value) <= 0) {
          return "Buy price  must be a positive number";
        }
        return null;
      },
    },
  });

  // graphql queries
  const { data, loading: productskuLoading } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 10000,
      page: 1,
    },
    onCompleted(data) {
      const productArr = [];
      data.products.data.forEach((item) => {
        productArr.push({ label: item.name, value: item.id });
      });
      setDropDownData(productArr);
    },
  });

  useEffect(() => {
    if (selectedProduct) {
      const selectedArr = [];
      selectedProduct.attributes.forEach((item) => {
        const selectedAttrVal = [];
        item.values?.forEach((val) => {
          selectedAttrVal.push({ label: val.value, value: val.id });
        });
        selectedArr.push({
          label: item.name,
          value: item.id,
          values: selectedAttrVal,
        });
      });
      setProductAttrs(selectedArr);
    }
  }, [selectedProduct]);

  const { height } = useViewportSize();
  const [addProductSku, { loading: addingSkuLoading }] =
    useMutation(CREATE_PRODUCT_SKUS, {});

  const submit = () => {
    addProductSku({
      variables: {
        price: parseInt(form.values.price),
        is_active: form.values.is_active,
        product: form.values.product,
        variants: form.values.variants,
        buy_price: parseFloat(form.values.buy_price)
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "ProductSKU Created Successfully",
        });
        fetchData(activePage);
        setOpened(false);
      },
      onError(err) {
        setOpened(true)
        showNotification({
          color: "red",
          title: "Error",
          message: `${err}`,
        });
      },
    });
  };

  const setProductToSelect = (val) => {
    console.log(val)
    form.setFieldValue("product", parseInt(val));
    setSelectedProduct(data.products.data.find((item) => item.id === val));
  };

  const setAttributeValues = (val, item) => {
    form.insertListItem("variants", {
      attribute: { connect: parseInt(item) },
      attribute_value: { connect: parseInt(val) },
    });
  };

  return productskuLoading ? (
    <LoadingOverlay
      visible={productskuLoading || addingSkuLoading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <ScrollArea style={{ height: height / 2.2 }} type="auto" offsetScrollbars>
      <form onSubmit={form.onSubmit(() => submit())}>
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                {...form.getInputProps("price")}
                type="number"
                placeholder="price"
                label="Price"
                error={form.errors.price}
                onChange={(e) => form.setFieldValue("price", e.target.value)}
              />
              <div style={{ marginTop: "10px" }}>
                <Checkbox
                  color="blue"
                  size="lg"
                  {...form.getInputProps("product")}
                  checked={form.values.is_active}
                  label="Is active"
                  onChange={(event) => {
                    form.setFieldValue(
                      "is_active",
                      event.currentTarget.checked
                    );
                  }}
                />
              </div>
            </Grid.Col>
            <Grid.Col span={6}>
            <TextInput
                {...form.getInputProps("buy_price")}
                type="number"
                placeholder="Buy price"
                label="Buy price"
                error={form.errors.buy_price}
                onChange={(e) => form.setFieldValue("buy_price", e.target.value)}
              />
              <Select
                searchable
                data={dropDownData}
                disabled={productskuLoading ? true : false}
                value={form.getInputProps("product")?.value?.toString()}
                onChange={setProductToSelect}
                label="Select Product"
                placeholder="Pick a product"
                styles={(theme) => ({
                  item: {
                    "&[data-selected]": {
                      "&, &:hover": {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.blue[6]
                            : theme.colors.blue[3],
                        color:
                          theme.colorScheme === "dark"
                            ? theme.white
                            : theme.colors.black,
                      },
                    },
                    "&[data-hovered]": {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.blue[9]
                          : theme.colors.blue[3],
                      color:
                        theme.colorScheme === "dark"
                          ? theme.white
                          : theme.colors.blue[9],
                    },
                  },
                })}
              />
              {productAttrs &&
                productAttrs.map((item, i) => {
                  return (
                    <Select
                      key={i}
                      data={item.values}
                      onChange={(val) => setAttributeValues(val, item.value)}
                      label={item.label}
                      placeholder={"pick_" + item.label}
                      color="blue"
                    />
                  );
                })}
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={4}>
              <Button
                style={{
                  width: "25%",
                  marginTop: "15px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                type="submit"
                fullWidth
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </ScrollArea>
  );
};

export default ProductSkuAddModal;
