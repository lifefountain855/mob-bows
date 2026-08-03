@REM git subtree add --prefix=BP/ bp_repo main --squash
@REM git subtree add --prefix=RP/ rp_repo main --squash
git subtree pull --prefix=BP/ bp_repo main --squash --no-edit
git subtree pull --prefix=RP/ rp_repo main --squash --no-edit