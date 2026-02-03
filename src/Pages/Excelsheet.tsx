import React, { useState, useEffect, useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { IconButton, Menu, MenuItem, Chip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../Styles/styles.css";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export interface Property {
  id?: string;
  DATE: string;
  PROPERTY: string;
  VALUE: number;
  COMMISSION: number;
  CONTACT: string;
  CONTACT_STATUS: string; // ✅ NEW
  ADDRESS: string;
  REFERENCE_NO: number;
  STATUS: string; // ✅ NEW
  TITLE: string;
  PURPOSE: string;
}

function Excelsheet() {
  const [data, setData] = useState<Property[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentRow, setCurrentRow] = useState<any>(null);

  const propertiesCollection = collection(db, "properties");

  const formatNumber = (num: any) => {
    const val = Number(num);
    return isNaN(val) ? num : new Intl.NumberFormat("en-US").format(val);
  };


  const fetchData = async () => {
    const snapshot = await getDocs(propertiesCollection);

    const fetchedData = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      REFERENCE_NO: Number(d.data().REFERENCE_NO),
    })) as Property[];

    fetchedData.sort((a, b) => b.DATE.localeCompare(a.DATE));
    setData(fetchedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ STATUS STAMP COLOR
  const getStatusChip = (status: string) => {
    switch (status) {
      case "Sold":
        return <Chip label="SOLD" color="success" />;
      case "Leased":
        return <Chip label="LEASED" color="primary" />;
      case "Withdrawn":
        return <Chip label="WITHDRAWN" color="error" />;
      default:
        return <Chip label="AVAILABLE" color="warning" />;
    }
  };

  const columns = useMemo<MRT_ColumnDef<Property>[]>(
    () => [
      { accessorKey: "DATE", header: "Date" },
      { accessorKey: "PROPERTY", header: "Property Name" },

      {
        accessorKey: "STATUS",
        header: "Status",
        Cell: ({ cell }) => getStatusChip(cell.getValue<string>()),
        editVariant: "select",
        editSelectOptions: ["Available", "Sold", "Leased", "Withdrawn"],
      },

      {
        accessorKey: "VALUE",
        header: "Value",
        Cell: ({ cell }) => formatNumber(cell.getValue()),
      },

      {
        accessorKey: "COMMISSION",
        header: "Commission",
        Cell: ({ cell }) => formatNumber(cell.getValue()),
      },

      {
        accessorKey: "REFERENCE_NO",
        header: "Reference No.",
      },

      { accessorKey: "CONTACT", header: "Contact" },

      {
        accessorKey: "CONTACT_STATUS",
        header: "Contact Type",
        editVariant: "select",
        editSelectOptions: ["Owner", "Caretaker", "Agent", "Broker", "Developer"],
      },

      { accessorKey: "ADDRESS", header: "Address" },
    ],
    []
  );

  const handleMenuOpen = (e: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setAnchorEl(e.currentTarget);
    setCurrentRow(row);
  };

  return (
    <div className="container">
      <h1 className="title">Desh Nautilus — Property Management</h1>

      {/* ================= FORM ================= */}
      <div className="form-card">
        <h3 className="form-title">Add New Listing</h3>

        <button
  onClick={() => signOut(auth)}
  style={{ float: "right", marginBottom: "20px" }}
>
  Logout
</button>

        <form
          className="form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget as HTMLFormElement);

            const newEntry: Property = {
              DATE: fd.get("DATE") as string,
              PROPERTY: fd.get("PROPERTY") as string,
              VALUE: Number(fd.get("VALUE")),
              COMMISSION: Number(fd.get("COMMISSION")),
              CONTACT: fd.get("CONTACT") as string,
              CONTACT_STATUS: fd.get("CONTACT_STATUS") as string,
              ADDRESS: fd.get("ADDRESS") as string,
              REFERENCE_NO: Number(fd.get("REFERENCE_NO")),
              STATUS: fd.get("STATUS") as string,
              TITLE: "",
              PURPOSE: "",
            };

            try {
              const docRef = await addDoc(propertiesCollection, newEntry);

              setData((prev) => [{ ...newEntry, id: docRef.id }, ...prev]);

              (e.target as HTMLFormElement).reset();
            } catch (error) {
              alert("Failed to add property");
            }
          }}
        >
          <div className="input-group">
            <label>Date</label>
            <input name="DATE" type="date" required />
          </div>

          <div className="input-group">
            <label>Property Name</label>
            <input name="PROPERTY" type="text" required />
          </div>

          <div className="input-group">
            <label>Status</label>
            <select name="STATUS" required>
              <option value="Available">Available</option>
              <option value="Sold">Sold</option>
              <option value="Leased">Leased</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="input-group">
            <label>Value</label>
            <input name="VALUE" type="number" required />
          </div>

          <div className="input-group">
            <label>Commission</label>
            <input name="COMMISSION" type="number" required />
          </div>

          <div className="input-group">
            <label>Reference Number</label>
            <input name="REFERENCE_NO" type="number" required />
          </div>

          <div className="input-group">
            <label>Contact</label>
            <input name="CONTACT" type="text" />
          </div>

          <div className="input-group">
            <label>Contact Type</label>
            <select name="CONTACT_STATUS">
              <option>Owner</option>
              <option>Caretaker</option>
              <option>Agent</option>
              <option>Broker</option>
              <option>Developer</option>
            </select>
          </div>

          <div className="input-group">
            <label>Address</label>
            <input name="ADDRESS" type="text" />
          </div>

          <button type="submit" className="submit-btn">
            Save Property
          </button>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <MaterialReactTable
        columns={columns}
        data={data}
        enableEditing
        editDisplayMode="modal"
        onEditingRowSave={async ({ values, row, exitEditingMode }) => {
          await updateDoc(doc(db, "properties", row.original.id!), {
            ...values,
            VALUE: Number(values.VALUE),
            COMMISSION: Number(values.COMMISSION),
            REFERENCE_NO: Number(values.REFERENCE_NO),
          });

          await fetchData();
          exitEditingMode();
        }}
        renderRowActions={({ row, table }) => (
          <>
            <IconButton onClick={(e) => handleMenuOpen(e, row)}>
              <MoreVertIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem
                onClick={() => {
                  table.setEditingRow(currentRow);
                  setAnchorEl(null);
                }}
              >
                Edit Entry
              </MenuItem>

              <MenuItem
                onClick={async () => {
                  if (window.confirm("Delete?")) {
                    await deleteDoc(doc(db, "properties", currentRow.original.id));
                    fetchData();
                  }
                  setAnchorEl(null);
                }}
              >
                Delete Permanently
              </MenuItem>
            </Menu>
          </>
        )}
        enableRowActions
      />
    </div>
  );
}

export default Excelsheet;
