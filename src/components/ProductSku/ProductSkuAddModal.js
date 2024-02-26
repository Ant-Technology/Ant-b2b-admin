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
}) => {
  const [dropDownData, setDropDownData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState();
  const [productAttrs, setProductAttrs] = useState();

  const form = useForm({
    initialValues: {
      sku: "",
      price: null,
      is_active: false,
      product: null,
      variants: [],
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
        item.values.forEach((val) => {
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
  const [addProductSku, { loading: addingSkuLoading }] = useMutation(
    CREATE_PRODUCT_SKUS,
    {
      update(cache, { data: { createProductSku } }) {
        cache.updateQuery(
          {
            query: GET_PRODUCT_SKUS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.productSkus.data.length === 10) {
              setTotal(total + 1);
              setActivePage(total + 1);
            } else {
              return {
                productSkus: {
                  data: [createProductSku, ...data.productSkus.data],
                },
              };
            }
          }
        );
      },
    }
  );

  const submit = () => {
    addProductSku({
      variables: {
        sku: form.values.sku,
        price: parseInt(form.values.price),
        is_active: form.values.is_active,
        product: form.values.product,
        variants: form.values.variants,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "ProductSKU Created Successfully",
        });
        setOpened(false);
      },
      onError(err) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${err}`,
        });
      },
    });
  };

  const setProductToSelect = (val) => {
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
    <>
      <ScrollArea style={{ height: height / 2.2 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  type="text"
                  {...form.getInputProps("sku")}
                  placeholder="Sku unique id"
                  label="SKU"
                />
                <TextInput
                  {...form.getInputProps("price")}
                  type="number"
                  placeholder="price"
                  label="PRICE"
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
                <Select
                  data={dropDownData}
                  disabled={productskuLoading ? true : false}
                  value={form.getInputProps("product").value}
                  onChange={setProductToSelect}
                  label="Select Product"
                  placeholder="Pick a product"
                  styles={(theme) => ({
                    item: {
                      // applies styles to selected item
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

                      // applies styles to hovered item (with mouse or keyboard)
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
              <Grid.Col>
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

export default ProductSkuAddModal;
