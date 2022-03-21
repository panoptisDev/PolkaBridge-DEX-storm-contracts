import { Button, Card, Divider, makeStyles } from "@material-ui/core";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import Varified from "../../../assets/check.png";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import TokenIcon from "../../common/TokenIcon";
import { useEffect, useMemo } from "react";
import { allowanceAmount, TOKEN_ADDRESS } from "../../../constants/index";
import { connect } from "react-redux";
import { formattedNum, urls } from "../../../utils/formatters";
import {
  checkLpFarmAllowance,
  confirmLpFarmAllowance,
  getFarmInfo,
  getLpBalanceFarm,
  harvestRewards,
} from "../../../actions/farmActions";
import BigNumber from "bignumber.js";
import { fromWei, getPbrRewardApr } from "../../../utils/helper";
import { useTokenData } from "../../../contexts/TokenData";
import { useEthPrice } from "../../../contexts/GlobalData";
import useActiveWeb3React from "hooks/useActiveWeb3React";

const useStyles = makeStyles((theme) => ({
  card: {
    width: 350,
    borderRadius: 15,
    marginTop: 20,
    boxShadow: `rgb(0 0 0 / 1%) 0px 0px 1px, rgb(0 0 0 / 4%) 0px 4px 8px, rgb(0 0 0 / 4%) 0px 16px 24px, rgb(0 0 0 / 1%) 0px 24px 32px`,
    backgroundColor: theme.palette.primary.bgCard,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 15,
    [theme.breakpoints.down("md")]: {
      paddingLeft: 7,
      paddingRight: 7,
      width: 300,
    },
  },
  cardContents: {},
  avatar: {
    height: "30px",
  },
  tokenTitle: {
    fontWeight: 500,
    padding: 0,
    paddingLeft: 10,
    fontSize: 14,
    paddingBottom: 3,
    color: theme.palette.textColors.heading,
    paddingTop: 2,
  },
  link: {
    fontWeight: 500,
    padding: 0,
    paddingLeft: 10,
    fontSize: 13,
    paddingBottom: 4,
    color: "#DF097C",
    paddingTop: 2,
  },
  tokenValues: {
    fontWeight: 500,
    padding: 0,
    paddingLeft: 10,
    fontSize: 24,
    paddingBottom: 3,

    color: theme.palette.textColors.subheading,
  },
  tokenAmount: {
    fontWeight: 600,
    marginRight: 5,
    fontSize: 16,
    color: theme.palette.textColors.pbr,

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  earn: {
    textAlign: "center",
    color: theme.palette.textColors.subheading,
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid #C80C81",
    borderRadius: 25,
    height: 30,
    width: 100,
    paddingTop: 3,
  },
  farmName: {
    textAlign: "center",
    color: theme.palette.textColors.heading,

    fontSize: 15,
    fontWeight: 600,
  },
  tagWrapper: {
    padding: 8,
  },
  imgWrapper: {
    padding: 15,
  },
  harvestButton: {
    backgroundColor: theme.palette.primary.iconBack,
    color: theme.palette.textColors.heading,
    textTransform: "none",
    fontSize: 17,
    width: 110,
    borderRadius: 15,
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "8px 50px 8px 50px",
    "&:hover": {
      background: "rgba(224, 7, 125, 0.7)",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 14,
    },
  },
  approveBtn: {
    backgroundColor: theme.palette.primary.pbr,
    color: theme.palette.primary.buttonText,
    textTransform: "none",
    fontSize: 17,
    borderRadius: 15,
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    padding: "8px 50px 8px 50px",
    "&:hover": {
      background: "rgba(224, 7, 125, 0.7)",
    },
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
  },
  stakeBtn: {
    backgroundColor: theme.palette.primary.pbr,
    color: theme.palette.primary.buttonText,
    textTransform: "none",
    fontSize: 28,
    borderRadius: 15,
    height: 40,
    width: 50,
    willChange: "transform",
    transition: "transform 450ms ease 0s",
    transform: "perspective(1px) translateZ(0px)",
    paddingBottom: 10,
    "&:hover": {
      background: "rgba(224, 7, 125, 0.7)",
    },
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
  },
  icon: {
    fontSize: 16,
  },
}));

const Farm = (props) => {
  const {
    farmPool,
    onStake,
    farm: { farms, lpApproved, loading, lpBalance },
    dex: { transaction },
    getFarmInfo,
    checkLpFarmAllowance,
    confirmLpFarmAllowance,
    getLpBalanceFarm,
    harvestRewards,
  } = props;
  const classes = useStyles();

  const { chainId, account } = useActiveWeb3React();

  const pbrPriceData = useTokenData(
    TOKEN_ADDRESS.PBR?.[chainId]?.toLowerCase()
  );

  const pbrPriceUsd = useMemo(() => {
    if (!pbrPriceData) {
      return "0";
    }
    return pbrPriceData?.priceUSD;
  }, [pbrPriceData]);

  const ethPrice = useEthPrice();
  const { address, pid, multiplier, decimals, lpApr, name } = farmPool;

  useEffect(() => {
    async function loadFarmData() {
      Promise.all([
        checkLpFarmAllowance(address, account, chainId),
        getFarmInfo(address, pid, account, chainId),
        getLpBalanceFarm(address, account, chainId),
      ]);
    }
    loadFarmData();
  }, [account, chainId, address, pid]);

  const farmData = useMemo(() => {
    if (!farms) {
      return {};
    }
    return farms?.[address];
  }, [address, farms]);

  const totalPoolLiquidityUSDValue = useMemo(() => {
    if (!ethPrice || !lpBalance) {
      return "0";
    }
    const poolTotalLpTokens = lpBalance?.[address]?.poolLpTokens;
    const usdValue = new BigNumber(poolTotalLpTokens)
      .times(ethPrice?.[0])
      .toString();

    return usdValue;
  }, [ethPrice, lpBalance, address]);

  const totalValueLockedUSD = useMemo(() => {
    if (!ethPrice || !farmData?.lockedLp || !lpBalance) {
      return "0";
    }

    const lpTokenPrice = lpBalance?.[address]?.lpTokenPrice;
    const lockedLpTokens = farmData?.lockedLp;
    return new BigNumber(lockedLpTokens)
      .times(lpTokenPrice)
      .times(ethPrice?.[0])
      .toString();
  }, [ethPrice, farmData, lpBalance, address]);

  const parseStakedAmount = useMemo(() => {
    if (!farmData) {
      return 0;
    }

    return fromWei(farmData?.stakeData?.amount, decimals);
  }, [farmData, decimals]);

  const isPoolApproved = useMemo(() => {
    if (!lpApproved) {
      return false;
    }
    return lpApproved?.[address];
  }, [lpApproved, address]);

  const isPoolLoading = useMemo(() => {
    return loading && loading?.[address];
  }, [loading, address]);

  const handleApproveLpTokenToFarm = async () => {
    await confirmLpFarmAllowance(allowanceAmount, address, account, chainId);
  };

  const farmApr = useMemo(() => {
    const poolWeight = farmData?.poolWeight;

    const pbrRewardApr = getPbrRewardApr(
      poolWeight,
      pbrPriceUsd,
      totalPoolLiquidityUSDValue
    );
    const totalApr = new BigNumber(pbrRewardApr)
      .plus(lpApr)
      .toFixed(0)
      .toString();
    return totalApr;
  }, [farmData, lpApr, pbrPriceUsd, totalPoolLiquidityUSDValue]);

  // useEffect(() => {
  //   console.log("aprTest ", {
  //     pbrPriceUsd,
  //     farmData,
  //     totalPoolLiquidityUSDValue,
  //   });
  // }, [pbrPriceUsd, farmData, totalPoolLiquidityUSDValue]);

  const handleStakeActions = (actionType = "stake") => {
    onStake(name, actionType, address, decimals, pid);
  };

  const harvestDisableStatus = useMemo(() => {
    return (
      loading?.[address] ||
      new BigNumber(!farmData?.pendingPbr ? 0 : farmData.pendingPbr).eq(0)
    );
  }, [farmData, address, loading]);

  const handleHarvest = async () => {
    await harvestRewards(address, pid, account, chainId);

    await getFarmInfo(address, pid, account, chainId);
  };

  return (
    <Card elevation={10} className={classes.card}>
      <div className={classes.cardContents}>
        <div className="d-flex justify-content-between align-items-center">
          <div className={classes.imgWrapper}>
            <TokenIcon
              className={classes.avatar}
              symbol={name?.split("-")?.[0]}
            />
            <TokenIcon
              className={classes.avatar}
              symbol={name?.split("-")?.[1]}
            />
          </div>
          <div>
            <div className={classes.farmName}>{name}</div>
            <div className={classes.tagWrapper}>
              <div className={classes.earn}>
                <img
                  style={{ height: 20, width: 20, marginRight: 5 }}
                  src={Varified}
                />
                Core {multiplier}X
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className={classes.tokenTitle}>APR </div>

          <div className="d-flex align-items-center">
            <div className={classes.tokenAmount}>{farmApr}% </div>
            <ShowChartIcon className={classes.tokenAmount} fontSize="small" />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className={classes.tokenTitle}>EARN</div>
          <div className={classes.tokenAmount}>PBR + Fees </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className={classes.tokenTitle}>PBR earned</div>
          <div className={classes.tokenAmount}></div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className={classes.tokenValues}>
            {formattedNum(fromWei(farmData?.pendingPbr))}
          </div>
          <Button
            className={classes.harvestButton}
            disabled={harvestDisableStatus}
            onClick={handleHarvest}
          >
            Harvest
          </Button>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className={classes.tokenTitle}>{name} LP STAKED</div>
          <div className={classes.tokenAmount}></div>
        </div>

        {!isPoolApproved && !isPoolLoading && (
          <div className="d-flex justify-content-center align-items-center mt-1">
            <Button
              onClick={handleApproveLpTokenToFarm}
              className={classes.approveBtn}
            >
              Approve LP Tokens
            </Button>
          </div>
        )}

        {isPoolApproved && !isPoolLoading && (
          <div className="d-flex justify-content-between align-items-center mt-1">
            <div className={classes.tokenValues}>
              {formattedNum(parseStakedAmount)}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <Button
                onClick={() => handleStakeActions("stake")}
                className={classes.stakeBtn}
                style={{ marginRight: 5 }}
              >
                +
              </Button>
              <Button
                onClick={() => handleStakeActions("unstake")}
                className={classes.stakeBtn}
                style={{ fontSize: 36 }}
              >
                -
              </Button>
            </div>
          </div>
        )}

        {isPoolLoading && (
          <div className="d-flex justify-content-center align-items-center mt-1">
            <Button disabled={true} className={classes.approveBtn}>
              {transaction.type && transaction.status === "pending"
                ? "Pending transaction..."
                : "Loading pool..."}
            </Button>
          </div>
        )}

        <div className="mt-3">
          <Divider style={{ backgroundColor: "#616161", height: 1 }} />
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className={classes.tokenTitle}>Total Value Locked:</div>
          <div className={classes.tokenAmount}>
            ${formattedNum(totalValueLockedUSD)}
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className={classes.tokenTitle}>Total Liquidity:</div>
          <div className={classes.tokenAmount}>
            ${formattedNum(totalPoolLiquidityUSDValue)}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <a
            className={classes.link}
            target="_blank"
            rel="noreferrer"
            href={`/liquidity?action=add_liquidity&inputCurrency=${
              name && name.split("-")[0]
            }&outputCurrency=${name && name.split("-")[1]}`}
          >
            Get {name} LP{" "}
            <OpenInNewIcon fontSize="small" className={classes.icon} />{" "}
          </a>
          <div className={classes.tokenAmount}></div>
        </div>

        <div className="d-flex justify-content-between align-items-center ">
          <a
            target="_blank"
            rel="noreferrer"
            className={classes.link}
            href={urls.showAddress(address)}
          >
            View Contract{" "}
            <OpenInNewIcon fontSize="small" className={classes.icon} />{" "}
          </a>
          <div className={classes.tokenAmount}></div>
        </div>

        <div className="d-flex justify-content-between align-items-center ">
          <a target="_blank" className={classes.link} href={`/pair/${address}`}>
            See Pair Info{" "}
            <OpenInNewIcon fontSize="small" className={classes.icon} />{" "}
          </a>
        </div>
      </div>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  account: state.account,
  farm: state.farm,
  dex: state.dex,
});

export default connect(mapStateToProps, {
  getFarmInfo,
  checkLpFarmAllowance,
  confirmLpFarmAllowance,
  getLpBalanceFarm,
  harvestRewards,
})(Farm);
